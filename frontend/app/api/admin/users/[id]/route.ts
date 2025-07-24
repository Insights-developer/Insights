import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { checkAdmin, getUserFeatures } from '@/utils/rbac';

export async function PATCH(request: Request, context: any) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user directly from auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use getUserFeatures directly instead of checkAdmin
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard')) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const userId = context.params.id;
  const body = await request.json();

  console.log('--- DEBUG: PATCH /api/admin/users/[id] ---');
  console.log('Received User ID:', userId);
  console.log('Received Request Body:', JSON.stringify(body, null, 2));

  const { email, username, phone, groups } = body;

  try {
    // Update user details
    const { error: userError } = await supabase
      .from('users')
      .update({ email, username, phone })
      .eq('id', userId);

    if (userError) throw userError;

    // Update user groups
    // 1. Delete existing groups for the user
    const { error: deleteError } = await supabase
      .from('user_access_groups')
      .delete()
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    // 2. Insert new groups for the user
    if (groups && groups.length > 0) {
      const newGroupLinks = groups.map((groupId: number) => ({
        user_id: userId,
        group_id: groupId,
      }));
      const { error: insertError } = await supabase
        .from('user_access_groups')
        .insert(newGroupLinks);

      if (insertError) throw insertError;
    }

    return NextResponse.json({ message: 'User updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const supabase = createRouteHandlerClient({ cookies });
  
  // Get user directly from auth
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Use getUserFeatures directly instead of checkAdmin
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard')) {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  const userId = context.params.id;

  try {
    // First, delete related records in user_access_groups
    const { error: groupError } = await supabase
      .from('user_access_groups')
      .delete()
      .eq('user_id', userId);

    if (groupError) throw groupError;

    // Then, delete the user
    const { error: userError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (userError) throw userError;

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

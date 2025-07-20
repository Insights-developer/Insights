import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

// GET: Return a list of all users for admin UI
export async function GET(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC: allow only users with 'admin_dashboard' feature
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Select all users from the app users table (not from auth.users directly)
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

// PATCH: Edit user info—email, role, username, phone
// Body: { userId: string, email?: string, role?: string, username?: string, phone?: string }
export async function PATCH(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC - require 'admin_dashboard' permission
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, email, role: newRole, username, phone } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const updatePayload: any = {};
  if (email) updatePayload.email = email;
  if (newRole) updatePayload.role = newRole;
  if (username !== undefined) updatePayload.username = username;
  if (phone !== undefined) updatePayload.phone = phone;

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { error } = await supabase.from('users').update(updatePayload).eq('id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Optionally update Auth user as well
  // if (email) {
  //   await supabase.auth.admin.updateUserById(userId, { email });
  // }

  return NextResponse.json({ success: true });
}

// DELETE: Remove a user from the database (by id)
export async function DELETE(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC - require 'admin_dashboard' permission
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Delete from your app users table (cascades to user_access_groups via FK if set)
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Optionally also delete from Supabase Auth users (use with care!)
  // await supabase.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  
  // Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch user profile with login history
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id, email, username, phone, created_at, current_login_at, previous_login_at, login_count')
      .eq('id', user.id)
      .single();

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Fetch user groups
    const { data: userGroups, error: groupsError } = await supabase
      .from('user_access_groups')
      .select(`
        access_groups (
          name
        )
      `)
      .eq('user_id', user.id);

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
    }

    // Extract group names
    const groups = userGroups?.map((ug: any) => ug.access_groups?.name).filter(Boolean) || [];

    return NextResponse.json({
      email: userProfile.email,
      username: userProfile.username,
      phone: userProfile.phone,
      createdAt: userProfile.created_at,
      currentLoginAt: userProfile.current_login_at,
      previousLoginAt: userProfile.previous_login_at,
      loginCount: userProfile.login_count || 0,
      groups: groups,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

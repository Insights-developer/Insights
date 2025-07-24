import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

// === GET: Return all users WITH their group memberships ===
export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    // First check if we have a valid session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Session error:", sessionError.message);
      return NextResponse.json({ error: "Session error: " + sessionError.message }, { status: 401 });
    }
    
    if (!sessionData?.session) {
      return NextResponse.json({ error: "No active session found" }, { status: 401 });
    }
    
    // Then get the user
    const { data: auth, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error("User fetch error:", userError.message);
      return NextResponse.json({ error: "User authentication failed: " + userError.message }, { status: 401 });
    }
    
    const user = auth?.user;
    if (!user) {
      return NextResponse.json({ error: "No authenticated user found" }, { status: 401 });
    }
    
    // RBAC: admin_dashboard only
    const features = await getUserFeatures(user.id);
    if (!features.includes('admin_dashboard')) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

  // 1. Get all users
  const { data: users, error: usersError } = await supabase.from('users').select('*');
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  if (!users.length)
    return NextResponse.json({ users: [] });

  const userIds = users.map(u => u.id);

  // 2. Get all user<->groups in one call
  const { data: userGroups, error: ugErr } = await supabase
    .from('user_access_groups')
    .select('user_id, group_id');
  if (ugErr)
    return NextResponse.json({ error: ugErr.message }, { status: 500 });

  // 3. Get all group info
  const { data: allGroups, error: agError } = await supabase
    .from('access_groups')
    .select('id, name');
  if (agError)
    return NextResponse.json({ error: agError.message }, { status: 500 });

  // Map group id to name
  const groupMap = Object.fromEntries(
    (allGroups || []).map(g => [g.id, { id: g.id, name: g.name }])
  );

  // Build per-user group arrays
  const userToGroups: Record<string, { id: number, name: string }[]> = {};
  (userGroups || []).forEach(ug => {
    if (!userToGroups[ug.user_id]) userToGroups[ug.user_id] = [];
    if (groupMap[ug.group_id])
      userToGroups[ug.user_id].push(groupMap[ug.group_id]);
  });

  // Final users array: add `groups` property
  const usersWithGroups = users.map(u => ({
    ...u,
    groups: userToGroups[u.id] || []
  }));

  return NextResponse.json({ users: usersWithGroups });
  } catch (error) {
    console.error("Error in GET /api/admin/users:", error);
    return NextResponse.json({ error: (error as Error).message || "Unknown error occurred" }, { status: 500 });
  }
}

// === PATCH: Edit user profile and group memberships ===
export async function PATCH(req: NextRequest) {
  const supabase = createClient();

  // RBAC: admin_dashboard only
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, email, username, phone, groupIds } = await req.json();
  if (!userId)
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  // 1. Update user profile fields
  const updatePayload: any = {};
  if (email) updatePayload.email = email;
  if (username !== undefined) updatePayload.username = username;
  if (phone !== undefined) updatePayload.phone = phone;

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase.from('users').update(updatePayload).eq('id', userId);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 2. Update group memberships, if requested:
  if (Array.isArray(groupIds)) {
    // Remove all of the user's current groups
    await supabase.from('user_access_groups').delete().eq('user_id', userId);

    // Insert new group memberships (skip if empty)
    if (groupIds.length > 0) {
      const inserts = groupIds.map((groupId: number) => ({
        user_id: userId,
        group_id: groupId
      }));
      const { error: insertError } = await supabase.from('user_access_groups').insert(inserts);
      if (insertError)
        return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ success: true });
}

// === DELETE: Remove a user (and all their group memberships) ===
export async function DELETE(req: NextRequest) {
  const supabase = createClient();

  // RBAC: admin_dashboard only
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId } = await req.json();
  if (!userId)
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });

  // Deletes from users (should cascade to user_access_groups)
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Optionally: Delete from Supabase Auth users as well (disabled for safety)
  // await supabase.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}

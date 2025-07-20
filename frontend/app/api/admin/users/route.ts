// /app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

/**
 * GET: Return a list of all users for admin UI
 * Response: { users: UserProfile[] }
 */
export async function GET(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC: only allow admin users
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = await getUserRole(user.id);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Select all users from the app users table (not from auth.users directly)
  const { data: users, error } = await supabase.from('users').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users });
}

/**
 * PATCH: Edit user info—email and/or role
 * Body: { userId: string, email?: string, role?: string }
 */
export async function PATCH(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(user.id);
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { userId, email, role: newRole } = await req.json();
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Update users table in your app DB. 
  const updatePayload: any = {};
  if (email) updatePayload.email = email;
  if (newRole) updatePayload.role = newRole;

  const { error } = await supabase.from('users').update(updatePayload).eq('id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If email update, optionally update in auth.users too
  // (uncomment below if you want to keep supabase auth.users in sync)
  /*
  if (email) {
    await supabase.auth.admin.updateUserById(userId, { email });
  }
  */

  return NextResponse.json({ success: true });
}

/**
 * DELETE: Remove a user from the database (by id)
 * Body: { userId: string }
 */
export async function DELETE(req: NextRequest) {
  const supabase = createClient();

  // Admin RBAC
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const role = await getUserRole(user.id);
  if (role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
  // Uncomment if you want to fully remove:
  // await supabase.auth.admin.deleteUser(userId);

  return NextResponse.json({ success: true });
}

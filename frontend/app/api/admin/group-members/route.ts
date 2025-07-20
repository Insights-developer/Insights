import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

// GET: List all user/group memberships
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getUserRole(data.user.id);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { data: memberships, error } = await supabase.from('user_access_groups').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ memberships });
}

// POST: Add user to group
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getUserRole(data.user.id);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, groupId } = await req.json();
    if (!userId || !groupId) {
      return NextResponse.json({ error: "userId and groupId required" }, { status: 400 });
    }
    const { error } = await supabase
      .from('user_access_groups')
      .insert([{ user_id: userId, group_id: groupId }]);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

// DELETE: Remove user from group
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = await getUserRole(data.user.id);
  if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const { userId, groupId } = await req.json();
    if (!userId || !groupId) {
      return NextResponse.json({ error: "userId and groupId required" }, { status: 400 });
    }
    const { error } = await supabase
      .from('user_access_groups')
      .delete()
      .eq('user_id', userId)
      .eq('group_id', groupId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
}

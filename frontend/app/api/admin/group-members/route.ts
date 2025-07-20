import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const role = await getUserRole(user.id);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const payload = await req.json();

    const userId = String(payload.userId);
    const groupId = Number(payload.groupId);

    if (!userId || Number.isNaN(groupId)) {
      return NextResponse.json(
        { error: 'userId must be a string and groupId a valid number.' },
        { status: 400 }
      );
    }

    // -- Main Fix: use as any to satisfy type checker --
    const { error } = await supabase
      .from('user_access_groups')
      .delete()
      .eq('user_id', userId as any)
      .eq('group_id', groupId as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
}

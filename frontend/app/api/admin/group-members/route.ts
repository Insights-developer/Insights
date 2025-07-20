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

  let userId: string | undefined;
  let groupId: number | undefined;

  try {
    const payload = await req.json();

    // Strong, explicit type checking and conversion
    userId = typeof payload.userId === 'string' ? payload.userId : undefined;

    if (typeof payload.groupId === 'number') {
      groupId = payload.groupId;
    } else if (typeof payload.groupId === 'string' && payload.groupId.trim() !== '' && !isNaN(Number(payload.groupId))) {
      groupId = Number(payload.groupId);
    } else {
      groupId = undefined;
    }

    if (!userId || !groupId || isNaN(groupId)) {
      return NextResponse.json(
        { error: 'userId must be a string and groupId a valid number.' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_access_groups')
    .delete()
    .eq('user_id', userId)
    .eq('group_id', groupId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: groups, error } = await supabase.from('access_groups').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ groups });
}

export async function POST(req: NextRequest) {
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

  const { name, description } = await req.json();

  if (!name || typeof name !== 'string') {
    return NextResponse.json(
      { error: 'Name is required and must be a string.' },
      { status: 400 }
    );
  }

  // Explicit insert object type
  const insertObj: { name: string; description?: string | null } = {
    name,
    description: typeof description === 'string' ? description : null,
  };

  const { error } = await supabase
    .from('access_groups')
    .insert([insertObj]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

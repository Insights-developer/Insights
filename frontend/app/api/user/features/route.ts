import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const features = await getUserFeatures(user.id);
  return NextResponse.json({ features });
}

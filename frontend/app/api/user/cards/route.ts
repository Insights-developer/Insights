import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

export async function GET(req: NextRequest) {
  const supabase = createClient();

  // 1. Authenticate user
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. User's allowed feature keys
  const featureKeys = await getUserFeatures(user.id);
  if (!featureKeys || featureKeys.length === 0) {
    return NextResponse.json({ cards: [] });
  }

  // 3. Query type='card' features this user is allowed
  const { data: cardFeatures, error } = await supabase
    .from('features')
    .select('key, nav_name, url, icon_url, order, active, type')
    .eq('active', true)
    .eq('type', 'card')
    .in('key', featureKeys)
    .order('order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const cards = (cardFeatures || []).map(f => ({
    key: f.key,
    label: f.nav_name || f.key,
    url: f.url && f.url.trim().length > 0 ? f.url : `/${f.key}`,
    icon: f.icon_url || null,
    order: f.order ?? 0,
  }));

  return NextResponse.json({ cards });
}

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

  // 2. Get allowed feature keys for this user
  const featureKeys = await getUserFeatures(user.id);
  if (!featureKeys || featureKeys.length === 0) {
    return NextResponse.json({ nav: [] });
  }

  // 3. Get all pages the user may access from features table
  const { data: navFeatures, error } = await supabase
    .from('features')
    .select('key, nav_name, url, icon_url, order, active, type')
    .eq('active', true)
    .eq('type', 'page')
    .in('key', featureKeys)
    .order('order', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 4. Massage results: use /key for url if URL is blank, icon_url can be null, nav_name required
  const nav = (navFeatures || []).map(f => ({
    key: f.key,
    label: f.nav_name || f.key,
    url: f.url && f.url.trim().length > 0 ? f.url : `/${f.key}`,
    icon: f.icon_url || null,
    order: f.order ?? 0,
  }));

  return NextResponse.json({ nav });
}

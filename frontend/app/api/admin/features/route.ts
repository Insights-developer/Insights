import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
// import { getUserRole } from '@/utils/rbac';
import { getUserFeatures } from '@/utils/rbac';

// GET: List all features (public for UI, optional gate)
export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('features').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ features: data });
}

// POST: Add a new feature (admin permission required)
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RBAC by features (group permissions)
  const features = await getUserFeatures(data.user.id);
  if (!features.includes('admin_dashboard'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key, name, description } = await req.json();
  if (!key || !name) {
    return NextResponse.json({ error: 'Both key and name are required.' }, { status: 400 });
  }
  const { error } = await supabase.from('features').insert([{ key, name, description: description ?? null }]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// PATCH: Edit feature (by key)
export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RBAC by features
  const features = await getUserFeatures(data.user.id);
  if (!features.includes('admin_dashboard'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key, name, description } = await req.json();
  if (!key) return NextResponse.json({ error: 'Feature key is required.' }, { status: 400 });

  const { error } = await supabase
    .from('features')
    .update({ ...(name && { name }), ...(description !== undefined && { description }) })
    .eq('key', key);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// DELETE: Remove feature (by key)
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // RBAC by features
  const features = await getUserFeatures(data.user.id);
  if (!features.includes('admin_dashboard'))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { key } = await req.json();
  if (!key) return NextResponse.json({ error: 'Feature key is required.' }, { status: 400 });

  const { error } = await supabase.from('features').delete().eq('key', key);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserFeatures } from "@/utils/rbac";

// Helper for admin RBAC guard, returns null for client if forbidden
async function getAdminSupabase(req: NextRequest) {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) return { supabase: null, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const features = await getUserFeatures(user.id);
  if (!features.includes('admin_dashboard'))
    return { supabase: null, response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { supabase, response: null };
}

// GET: fetch all features (admin)
export async function GET(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { data: features, error } = await supabase.from('features').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ features });
}

// POST: create a new feature
export async function POST(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { key, name, description, type, nav_name, icon_url, order, url, active } = await req.json();
  if (!key || !name) return NextResponse.json({ error: 'Key and name are required' }, { status: 400 });

  const { error } = await supabase.from('features').insert({
    key, name, description, type, nav_name, icon_url, order, url, active
  } as any);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// PATCH: update an existing feature (by id)
export async function PATCH(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing feature ID' }, { status: 400 });

  const { error } = await supabase.from('features').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserFeatures } from '@/utils/rbac';

// Helper for admin RBAC guard
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

// GET: fetch all insight templates (admin)
export async function GET(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { data: templates, error } = await supabase.from('insight_templates').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ templates });
}

// POST: create a new insight template
export async function POST(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { template_name, description, config } = await req.json();
  if (!template_name) return NextResponse.json({ error: 'Template name is required' }, { status: 400 });

  const { error } = await supabase.from('insight_templates').insert({
    template_name, 
    description, 
    config
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// PATCH: update an existing insight template
export async function PATCH(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { id, ...fields } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });

  const { error } = await supabase.from('insight_templates').update(fields).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

// DELETE: remove an insight template
export async function DELETE(req: NextRequest) {
  const { supabase, response } = await getAdminSupabase(req);
  if (!supabase) return response!;
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing template ID' }, { status: 400 });

  const { error } = await supabase.from('insight_templates').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

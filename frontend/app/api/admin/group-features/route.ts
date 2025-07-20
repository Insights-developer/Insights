// /frontend/app/api/admin/group-features/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

// GET: List all features for a given group
export async function GET(req: NextRequest) {
  const groupId = Number(req.nextUrl.searchParams.get('groupId'));
  if (Number.isNaN(groupId)) {
    return NextResponse.json({ error: 'Invalid groupId' }, { status: 400 });
  }
  const supabase = createClient();
  const { data, error } = await supabase
    .from('access_group_features')
    .select('feature')
    .eq('group_id', groupId as any);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  // Return as an array of strings
  return NextResponse.json({ features: (data ?? []).map(item => item.feature) });
}

// POST: Add a feature to a group
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = await getUserRole(data.user.id);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { groupId, feature } = await req.json();
    if (
      typeof groupId !== 'number' ||
      typeof feature !== 'string' ||
      feature.trim().length === 0
    ) {
      throw new Error('groupId (number) and feature (non-empty string) are required.');
    }
    const { error } = await supabase
      .from('access_group_features')
      .insert([{ group_id: groupId as any, feature }]);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Invalid JSON body' }, { status: 400 });
  }
}

// DELETE: Remove a feature from a group
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  if (!data?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = await getUserRole(data.user.id);
  if (role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { groupId, feature } = await req.json();
    if (
      typeof groupId !== 'number' ||
      typeof feature !== 'string' ||
      feature.trim().length === 0
    ) {
      throw new Error('groupId (number) and feature (non-empty string) are required.');
    }
    const { error } = await supabase
      .from('access_group_features')
      .delete()
      .eq('group_id', groupId as any)
      .eq('feature', feature);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Invalid JSON body' }, { status: 400 });
  }
}

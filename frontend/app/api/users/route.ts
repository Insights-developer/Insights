import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/rbac';

export async function GET() {
  const supabase = createClient();
  // Assumes the authenticated user is an admin; add authentication as needed
  const { data, error } = await supabase.from('users').select('id, email, role, created_at');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data });
}

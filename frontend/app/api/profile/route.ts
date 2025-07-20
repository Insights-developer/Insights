import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = createClient();
  // Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch profile from 'users' table
  const { data, error } = await supabase
    .from('users')
    .select('id, email, username, phone, created_at')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data });
}

export async function PATCH(req: NextRequest) {
  const supabase = createClient();
  // Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email, username, phone } = await req.json();
  const updates: any = {};

  if (email) updates.email = email;
  if (username !== undefined) updates.username = username;
  if (phone !== undefined) updates.phone = phone;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  // Update profile in 'users' table (the app profile)
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Optionally: update email in Supabase Auth as well.
  // if (email) {
  //   await supabase.auth.admin.updateUserById(user.id, { email });
  // }

  return NextResponse.json({ success: true });
}

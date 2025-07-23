import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET: Retrieve user's uploads
export async function GET(req: NextRequest) {
  const supabase = createClient();
  
  // 1. Require authentication
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Query uploads for this user
  const { data: uploads, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('user_id', user.id)
    .order('uploaded_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ uploads });
}

// POST: Create a new upload record
export async function POST(req: NextRequest) {
  const supabase = createClient();
  
  // 1. Require authentication
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Get upload details from request
  const { filename, blob_url } = await req.json();
  
  if (!filename || !blob_url) {
    return NextResponse.json({ error: 'Filename and blob URL are required' }, { status: 400 });
  }
  
  // 3. Create upload record
  const { data, error } = await supabase.from('uploads').insert({
    user_id: user.id,
    filename,
    blob_url
  }).select('id').single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ 
    success: true, 
    upload_id: data.id 
  }, { status: 201 });
}

// DELETE: Remove an upload record
export async function DELETE(req: NextRequest) {
  const supabase = createClient();
  
  // 1. Require authentication
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Get upload ID from request
  const { id } = await req.json();
  
  if (!id) {
    return NextResponse.json({ error: 'Upload ID is required' }, { status: 400 });
  }
  
  // 3. Verify ownership before deletion (security)
  const { data } = await supabase
    .from('uploads')
    .select('user_id')
    .eq('id', id)
    .single();
    
  if (!data || data.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 });
  }
  
  // 4. Delete the upload record
  const { error } = await supabase.from('uploads').delete().eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true });
}

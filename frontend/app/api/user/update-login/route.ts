import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = createClient();
  
  // Authenticate
  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user;

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // First get current login time to set as previous
    const { data: currentUser } = await supabase
      .from('users')
      .select('current_login_at, login_count')
      .eq('id', user.id)
      .single();

    // Update user login timestamps
    const { error } = await supabase
      .from('users')
      .update({
        previous_login_at: currentUser?.current_login_at || null,
        current_login_at: new Date().toISOString(),
        login_count: (currentUser?.login_count || 0) + 1
      })
      .eq('id', user.id);

    if (error) {
      console.error('Login update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Login update error:', error);
    return NextResponse.json({ error: 'Failed to update login' }, { status: 500 });
  }
}

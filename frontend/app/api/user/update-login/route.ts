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
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        previous_login_at: currentUser?.current_login_at || null,
        current_login_at: new Date().toISOString(),
        login_count: (currentUser?.login_count || 0) + 1
      })
      .eq('id', user.id);

    if (userUpdateError) {
      console.error('Login update error:', userUpdateError);
      return NextResponse.json({ error: userUpdateError.message }, { status: 500 });
    }

    // Also log to login_history table
    const ipAddress = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';
    
    const { error: historyError } = await supabase
      .from('login_history')
      .insert({
        user_id: user.id,
        login_at: new Date().toISOString(),
        ip_address: ipAddress.split(',')[0].trim(), // Get first IP if multiple
        user_agent: userAgent
      });
      
    if (historyError) {
      console.error('Login history insert error:', historyError);
      // Don't fail the request if only the history insert fails
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Login update error:', error);
    return NextResponse.json({ error: 'Failed to update login' }, { status: 500 });
  }
}

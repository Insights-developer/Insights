// /app/login/actions.ts

'use server';

import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

// Example action for handling login
export async function login({ email, password }: { email: string; password: string }) {
  const supabase = createClient();

  // Example: Get the cookies for this request scope (no arguments!)
  const cookieStore = cookies();

  // Example: Call Supabase Auth API
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Optionally set an error cookie or handle error
    // cookieStore.set('login_error', error.message, { path: '/' });
    return { success: false, message: error.message };
  }

  // Optionally set a token or session cookie
  // cookieStore.set('session_id', data.session?.access_token || '', { path: '/' });

  return { success: true };
}

// /frontend/utils/supabase/browser.ts

import { createBrowserClient } from '@supabase/ssr';

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. Check your .env file.',
    { url: !!supabaseUrl, key: !!supabaseAnonKey }
  );
}

export const supabase = createBrowserClient(
  supabaseUrl!,
  supabaseAnonKey!,
  {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

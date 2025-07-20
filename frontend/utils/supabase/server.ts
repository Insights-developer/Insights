import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '../types';

// ONLY works in server files/components!
export function createClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookies() }
  );
}

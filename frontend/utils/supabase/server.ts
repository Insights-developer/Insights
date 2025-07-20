// /utils/supabase/server.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/utils/types';

export function createClient() {
  const cookieStore = cookies(); // sync, works in App Router

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

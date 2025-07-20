'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) {
        router.replace('/admin');
      } else {
        router.replace('/auth?error=Verification%20failed');
      }
    });
  }, [router]);

  return (
    <main style={{ maxWidth: 400, margin: '3rem auto', padding: 20, textAlign: 'center' }}>
      <h2>Verifying email…</h2>
      <p>Please wait, logging you in automatically.</p>
    </main>
  );
}

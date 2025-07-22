'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import AuthForm from './components/AuthForm';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // After login, attempt to promote from Guest to Member if newly verified.
        // Safe: if already member or not verified, does nothing/bails quietly.
        try {
          await fetch('/api/user/promote-if-verified', { method: 'POST' });
        } catch {
          // No action needed if promotion API fails silently
        }
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    }

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        router.replace('/dashboard');
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <main style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <AuthForm />
    </main>
  );
}

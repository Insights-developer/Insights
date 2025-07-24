'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthForm from './components/AuthForm';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext
export default function HomePage() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      if (auth.user) {
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

    if (!auth.loading) {
      checkAuth();
    }
  }, [auth.user, auth.loading, router]);

  if (loading || auth.loading) return <div>Loading...</div>;

  return (
    <main style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <AuthForm />
    </main>
  );
}

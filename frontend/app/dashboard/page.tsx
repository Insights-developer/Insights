'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data?.user) {
        // Redirect to login page if not authenticated
        router.replace('/');
      } else {
        setUser({ email: data.user.email ?? '' });
      }
      setLoading(false);
    });
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Will redirect

  return (
    <main style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
      <h1>User Dashboard</h1>
      <p>Welcome, <strong>{user.email}</strong>!</p>
      <p>
        This is your lottery dashboard. More features will appear here soon.
      </p>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.replace('/');
        }}
        style={{ marginTop: 32 }}
      >
        Sign Out
      </button>
    </main>
  );
}

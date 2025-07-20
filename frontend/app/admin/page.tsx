'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/'); // If not logged in, force to login (home)
        return;
      }
      // Query the user's role from your `users` table (use an API route or Supabase client)
      const { data: userData, error } = await supabase
        .from('users')
        .select('email, role')
        .eq('id', data.user.id)
        .single();

      if (!userData || error || userData.role !== 'admin') {
        // If not admin, redirect or show forbidden
        router.replace('/');
        return;
      }
      setUser({ email: userData.email, role: userData.role });
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading…</div>;
  if (!user) return null; // Redirected

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 20 }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ marginRight: 12, fontSize: 14, color: '#555' }}>
            {user.email}
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <h1>Admin Dashboard</h1>
      <ul style={{ lineHeight: 2, fontSize: 18 }}>
        <li>
          <a href="/admin/users">Manage Users</a>
        </li>
        <li>
          <a href="/admin/groups">Manage Groups &amp; Features</a>
        </li>
      </ul>
    </main>
  );
}

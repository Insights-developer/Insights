'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase/browser';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user session on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.push('/auth');
      } else {
        setUser({ email: data.user.email ?? '' });
      }
      setLoading(false);
    });
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) return <div>Loading…</div>;

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 20 }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/">Home</Link>
          {' | '}
          <Link href="/admin">Admin</Link>
          {' | '}
          <Link href="/auth">Sign In/Up</Link>
        </div>
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 12, fontSize: 14, color: '#555' }}>
                {user.email}
              </span>
              <button onClick={handleSignOut}>Sign Out</button>
            </>
          ) : null}
        </div>
      </header>

      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin. Use the tools below to manage users, groups, and permissions.</p>
      <ul style={{ lineHeight: 2, fontSize: 18 }}>
        <li>
          <Link href="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/groups">Manage Groups &amp; Features</Link>
        </li>
      </ul>
    </main>
  );
}

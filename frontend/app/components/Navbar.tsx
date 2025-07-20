'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

type UserMeta = { email: string; role: string };

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    let mounted = true;

    // Get session, then fetch user role from your "users" table
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        const { data: userMeta, error } = await supabase
          .from('users')
          .select('email, role')
          .eq('id', data.user.id)
          .single();

        if (mounted && userMeta) setUser(userMeta);
      }
    });

    return () => { mounted = false; };
  }, []);

  if (!user) return null; // Or a skeleton if you wish

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#f8f9fa',
        marginBottom: 32,
      }}
    >
      <div>
        <Link href="/dashboard" style={{ marginRight: 16 }}>
          Dashboard
        </Link>
        {user.role === 'admin' && (
          <Link href="/admin" style={{ marginRight: 16 }}>
            Admin Dashboard
          </Link>
        )}
      </div>
      <div>
        <span style={{ fontSize: 14, color: '#333', marginRight: 16 }}>
          {user.email}
        </span>
        <button onClick={handleSignOut}>Sign Out</button>
      </div>
    </nav>
  );
}

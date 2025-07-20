'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        if (mounted) setUser({ email: data.user.email ?? '' }); // <-- FIX applied here
        // Fetch features
        const resp = await fetch('/api/user/features');
        const { features } = await resp.json();
        if (mounted) setFeatures(features || []);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!user) return null;

  function has(feature: string) {
    return features.includes(feature);
  }

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
        {has('dashboard_page') && (
          <Link href="/dashboard" style={{ marginRight: 16 }}>
            Dashboard
          </Link>
        )}
        {has('games_page') && (
          <Link href="/games" style={{ marginRight: 16 }}>
            Games
          </Link>
        )}
        {has('insights_page') && (
          <Link href="/insights" style={{ marginRight: 16 }}>
            Insights
          </Link>
        )}
        {has('results_page') && (
          <Link href="/results" style={{ marginRight: 16 }}>
            Results
          </Link>
        )}
        {has('admin_dashboard') && (
          <Link href="/admin" style={{ marginRight: 16 }}>
            Admin Panel
          </Link>
        )}
        {has('profile_page') && (
          <Link href="/profile" style={{ marginRight: 16 }}>
            Profile
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

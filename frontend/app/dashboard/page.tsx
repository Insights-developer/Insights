'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';
import Forbidden from '../components/Forbidden';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setForbidden(false);

      // Authenticate
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/');
        return;
      }
      setUser({ email: data.user.email ?? '' });

      // Fetch feature keys for nav and widgets
      const resp = await fetch('/api/user/features');
      const { features } = await resp.json();

      // Require dashboard_page feature (uncomment to strictly gate dashboard)
      if (!features?.includes('dashboard_page')) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      setFeatures(features || []);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading dashboard…</div>;
  if (forbidden) return <Forbidden />;
  if (!user) return null; // Defensive: will already redirect

  const has = (feature: string) => features.includes(feature);

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <h1>User Dashboard</h1>
      <p>Welcome, <strong>{user.email}</strong>!</p>
      <p>
        This is your lottery dashboard. More features will appear here as you gain access.
      </p>
      <nav style={{ margin: '2rem 0' }}>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none', padding: 0, justifyContent: 'center' }}>
          {has('games_page') && (
            <li>
              <a href="/games">Games</a>
            </li>
          )}
          {has('insights_page') && (
            <li>
              <a href="/insights">Insights</a>
            </li>
          )}
          {has('results_page') && (
            <li>
              <a href="/results">Results</a>
            </li>
          )}
          {has('admin_dashboard') && (
            <li>
              <a href="/admin">Admin Panel</a>
            </li>
          )}
          <li>
            <a href="/profile">Profile</a>
          </li>
        </ul>
      </nav>
      <section style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 32 }}>
        {has('games_page') && (
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 18, minWidth: 160 }}>
            <b>Games</b>
            <p>View or play lottery games.</p>
          </div>
        )}
        {has('insights_page') && (
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 18, minWidth: 160 }}>
            <b>Insights</b>
            <p>Analyze draw patterns and trends.</p>
          </div>
        )}
        {has('results_page') && (
          <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 18, minWidth: 160 }}>
            <b>Results</b>
            <p>Browse past draw results.</p>
          </div>
        )}
      </section>
      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.replace('/');
        }}
        style={{ marginTop: 40 }}
      >
        Sign Out
      </button>
    </main>
  );
}

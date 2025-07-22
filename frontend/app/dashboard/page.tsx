'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';
import Forbidden from '../components/Forbidden';
import Card from '../components/ui/Cards';
import Button from '../components/ui/Buttons';
import Icon from '../components/ui/Icon';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setForbidden(false);

      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/');
        return;
      }
      setUser({ email: data.user.email ?? '' });

      // Always re-fetch features when pathname changes!
      const resp = await fetch('/api/user/features');
      const { features } = await resp.json();

      if (!features?.includes('dashboard_page')) {
        setForbidden(true);
        setLoading(false);
        return;
      }

      setFeatures(features || []);
      setLoading(false);
    })();
  }, [router, pathname]); // <-- Reacts to route changes!

  if (loading) return <div>Loading dashboard…</div>;
  if (forbidden) return <Forbidden />;
  if (!user) return null;

  const has = (feature: string) => features.includes(feature);

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <Card title="User Dashboard" icon={<Icon name="user" animate />}>
        <p>Welcome, <strong>{user.email}</strong>!</p>
        <p>This is your lottery dashboard. More features will appear here as you gain access.</p>
      </Card>
      <nav style={{ margin: '2rem 0' }}>
        <ul style={{ display: 'flex', gap: 24, listStyle: 'none', padding: 0, justifyContent: 'center' }}>
          {has('games_page') && <li><a href="/games" className="inline-flex items-center font-semibold rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"><Icon name="lock" style={{marginRight:8}} />Games</a></li>}
          {has('insights_page') && <li><a href="/insights" className="inline-flex items-center font-semibold rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"><Icon name="eye" style={{marginRight:8}} />Insights</a></li>}
          {has('results_page') && <li><a href="/results" className="inline-flex items-center font-semibold rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"><Icon name="mail" style={{marginRight:8}} />Results</a></li>}
          {has('admin_dashboard') && <li><a href="/admin" className="inline-flex items-center font-semibold rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"><Icon name="user" style={{marginRight:8}} />Admin Panel</a></li>}
          {has('profile_page') && <li><a href="/profile" className="inline-flex items-center font-semibold rounded px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition"><Icon name="user" style={{marginRight:8}} />Profile</a></li>}
        </ul>
      </nav>
      <section style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 32 }}>
        {has('games_page') && (
          <Card title="Games" icon={<Icon name="lock" animate />}>
            <p>View or play lottery games.</p>
          </Card>
        )}
        {has('insights_page') && (
          <Card title="Insights" icon={<Icon name="eye" animate />}>
            <p>Analyze draw patterns and trends.</p>
          </Card>
        )}
        {has('results_page') && (
          <Card title="Results" icon={<Icon name="mail" animate />}>
            <p>Browse past draw results.</p>
          </Card>
        )}
      </section>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
        <Button
          variant="secondary"
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/');
          }}
          iconLeft={<Icon name="lock" />}
        >
          Sign Out
        </Button>
      </div>
    </main>
  );
}

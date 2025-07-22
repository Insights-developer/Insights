'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';
import Forbidden from '../components/Forbidden';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
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

  if (loading) return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size={48} />
          <div className="mt-4 text-muted">Loading dashboard…</div>
        </div>
      </Card>
    </main>
  );
  if (forbidden) return <Forbidden />;

  const has = (feature: string) => features.includes(feature);

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <Card title="Dashboard" icon={<Icon name="home" animate />}>
        {/* Dashboard content will go here */}
      </Card>
      <section style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 32 }}>
        {has('games_page') && (
          <Card title="Games" icon={<Icon name="gamepad" animate />}>
            <p>View or play lottery games.</p>
          </Card>
        )}
        {has('insights_page') && (
          <Card title="Insights" icon={<Icon name="eye" animate />}>
            <p>Analyze draw patterns and trends.</p>
          </Card>
        )}
        {has('results_page') && (
          <Card title="Results" icon={<Icon name="trophy" animate />}>
            <p>Browse past draw results.</p>
          </Card>
        )}
      </section>
    </main>
  );
}

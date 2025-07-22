'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';
import { appCache } from '../../utils/cache';
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
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Set initial render to false after component mounts
    setIsInitialRender(false);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setForbidden(false);

      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        router.replace('/');
        return;
      }

      const CACHE_KEY = 'user-features';
      const CACHE_DURATION = 60000; // 1 minute cache

      // Check cache first
      const cachedFeatures = appCache.get<string[]>(CACHE_KEY);
      if (cachedFeatures) {
        if (!cachedFeatures.includes('dashboard_page')) {
          setForbidden(true);
        } else {
          setFeatures(cachedFeatures);
        }
        setLoading(false);
        return;
      }

      try {
        // Always re-fetch features when pathname changes!
        const resp = await fetch('/api/user/features');
        const { features } = await resp.json();

        if (!features?.includes('dashboard_page')) {
          setForbidden(true);
          setLoading(false);
          return;
        }

        // Cache the features
        appCache.set(CACHE_KEY, features || [], CACHE_DURATION);
        setFeatures(features || []);
      } catch (error) {
        console.error('Failed to fetch features:', error);
        // Use stale cache if available
        const staleFeatures = appCache.get<string[]>(CACHE_KEY);
        if (staleFeatures) {
          setFeatures(staleFeatures);
        }
      }

      setLoading(false);
    })();
  }, [router, pathname]); // <-- Reacts to route changes!

  // Always render the main layout structure to prevent layout shifts
  const renderDashboardLayout = (content: React.ReactNode, sectionContent?: React.ReactNode) => (
    <main style={{ 
      maxWidth: 900, 
      margin: '2rem auto', 
      padding: 24,
      backgroundColor: 'transparent',
      minHeight: '400px' // Ensure consistent minimum height
    }}>
      <Card title="Dashboard" icon={<Icon name="home" animate />}>
        <div style={{ minHeight: '100px' }}>
          {content}
        </div>
      </Card>
      {sectionContent && (
        <section style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 32 }}>
          {sectionContent}
        </section>
      )}
    </main>
  );

  // Loading state with consistent layout structure
  if (loading || isInitialRender) {
    return renderDashboardLayout(
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={48} />
        <div className="mt-4 text-muted" style={{ color: '#6b7280' }}>Loading dashboard…</div>
      </div>
    );
  }
  
  if (forbidden) return <Forbidden />;

  const has = (feature: string) => features.includes(feature);

  // Dashboard content
  const dashboardContent = (
    <div>
      {/* Dashboard content will go here */}
    </div>
  );

  // Section content for feature cards
  const sectionContent = (
    <>
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
    </>
  );

  return renderDashboardLayout(dashboardContent, sectionContent);
}

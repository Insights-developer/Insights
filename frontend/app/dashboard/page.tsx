'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../../utils/supabase/browser';
import { appCache } from '../../utils/cache';
import Forbidden from '../components/Forbidden';
import PageLayout, { usePageLoading } from '../components/ui/PageLayout';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { showLoading, LoadingContent } = usePageLoading(mounted, loading);

  useEffect(() => {
    setMounted(true);
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
        // Fetch user features
        const resp = await fetch('/api/user/features');
        const featuresData = await resp.json();
        const userFeatures = Array.isArray(featuresData.features) ? featuresData.features : [];
        
        // Cache the result
        appCache.set(CACHE_KEY, userFeatures, CACHE_DURATION);
        
        if (!userFeatures.includes('dashboard_page')) {
          setForbidden(true);
        } else {
          setFeatures(userFeatures);
        }
      } catch (error) {
        console.error('Failed to fetch user features:', error);
        // Use stale cache if available
        const staleFeatures = appCache.get<string[]>(CACHE_KEY);
        if (staleFeatures) {
          setFeatures(staleFeatures);
        }
      }

      setLoading(false);
    })();
  }, [router, pathname]);

  if (showLoading) {
    return (
      <PageLayout title="Dashboard" icon={<Icon name="home" animate />}>
        <LoadingContent>
          <Spinner size={48} />
          <div className="mt-4 text-gray-500">Loading dashboard…</div>
        </LoadingContent>
      </PageLayout>
    );
  }

  if (forbidden) return <Forbidden />;

  const has = (feature: string) => features.includes(feature);

  return (
    <PageLayout title="Dashboard" icon={<Icon name="home" animate />}>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="text-center py-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Insights</h2>
          <p className="text-gray-600">Access your lottery tools and analytics</p>
        </div>
        
        {/* Feature cards grid - responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {has('games_page') && (
            <Card title="Games" icon={<Icon name="gamepad" animate />}>
              <p className="text-gray-600">View or play lottery games.</p>
            </Card>
          )}
          {has('insights_page') && (
            <Card title="Insights" icon={<Icon name="eye" animate />}>
              <p className="text-gray-600">Analyze draw patterns and trends.</p>
            </Card>
          )}
          {has('results_page') && (
            <Card title="Results" icon={<Icon name="trophy" animate />}>
              <p className="text-gray-600">Browse past draw results.</p>
            </Card>
          )}
          {has('draws_page') && (
            <Card title="Draws" icon={<Icon name="shuffle" animate />}>
              <p className="text-gray-600">Participate in lottery draws.</p>
            </Card>
          )}
        </div>

        {/* Quick stats or additional info section */}
        {features.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center text-sm text-blue-700">
              <Icon name="user" className="mr-2" />
              <span>You have access to {features.length} feature{features.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import { appCache } from '../cache';

/**
 * Hook: Checks if user has the required featureKey permission.
 * Usage:
 *   const { allowed, loading, forbidden } = useRequireFeature('games_page');
 *   if (loading) return <Loading />;
 *   if (forbidden) return <Forbidden />;
 */
export function useRequireFeature(featureKey: string) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setForbidden(false);
      setAllowed(false);

      const authRes = await supabase.auth.getUser();
      if (!authRes.data?.user) {
        router.replace('/');
        return;
      }

      const CACHE_KEY = 'user-features';
      const CACHE_DURATION = 60000; // 1 minute cache

      // Check cache first
      const cachedFeatures = appCache.get<string[]>(CACHE_KEY);
      if (cachedFeatures) {
        if (!cachedFeatures.includes(featureKey)) {
          setAllowed(false);
          setForbidden(true);
        } else {
          setAllowed(true);
          setForbidden(false);
        }
        setLoading(false);
        return;
      }

      try {
        // Fetch allowed features
        const resp = await fetch('/api/user/features');
        const { features } = await resp.json();

        if (!features?.includes(featureKey)) {
          setAllowed(false);
          setForbidden(true);
          setLoading(false);
          return;
        }

        // Cache the features
        appCache.set(CACHE_KEY, features || [], CACHE_DURATION);
        setAllowed(true);
        setForbidden(false);
      } catch (error) {
        console.error('Failed to fetch features:', error);
        // Use stale cache if available
        const staleFeatures = appCache.get<string[]>(CACHE_KEY);
        if (staleFeatures && staleFeatures.includes(featureKey)) {
          setAllowed(true);
          setForbidden(false);
        } else {
          setAllowed(false);
          setForbidden(true);
        }
      }

      setLoading(false);
    })();
  }, [featureKey, router]);

  return { allowed, loading, forbidden };
}

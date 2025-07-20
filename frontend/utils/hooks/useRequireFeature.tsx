'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

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

      // Fetch allowed features
      const resp = await fetch('/api/user/features');
      const { features } = await resp.json();

      if (!features?.includes(featureKey)) {
        setAllowed(false);
        setForbidden(true);
        setLoading(false);
        return;
      }

      setAllowed(true);
      setForbidden(false);
      setLoading(false);
    })();
  }, [featureKey, router]);

  return { allowed, loading, forbidden };
}

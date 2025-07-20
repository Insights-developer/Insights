// hooks/useRequireFeature.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

export function useRequireFeature(featureKey: string) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authRes = await supabase.auth.getUser();
      if (!authRes.data?.user) {
        router.replace('/');
        return;
      }
      // Fetch features (assumes you have this endpoint)
      const resp = await fetch('/api/user/features');
      const { features } = await resp.json();
      if (!features?.includes(featureKey)) {
        router.replace('/'); // or show 403 page
        return;
      }
      setAllowed(true);
      setLoading(false);
    })();
  }, [featureKey, router]);

  return { allowed, loading };
}

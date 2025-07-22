'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import { appCache } from '../../utils/cache';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function DrawsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Set initial render to false after component mounts
    setIsInitialRender(false);
  }, []);

  useEffect(() => {
    (async () => {
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
        if (cachedFeatures.includes('draws_page')) {
          setAllowed(true);
        }
        setLoading(false);
        return;
      }

      try {
        const resp = await fetch('/api/user/features');
        const { features } = await resp.json();

        if (features?.includes('draws_page')) {
          setAllowed(true);
        }

        // Cache the features
        appCache.set(CACHE_KEY, features || [], CACHE_DURATION);
      } catch (error) {
        console.error('Failed to fetch features:', error);
        // Use stale cache if available
        const staleFeatures = appCache.get<string[]>(CACHE_KEY);
        if (staleFeatures && staleFeatures.includes('draws_page')) {
          setAllowed(true);
        }
      }

      setLoading(false);
    })();
  }, [router]);

  // Always render the main layout structure to prevent layout shifts
  const renderDrawsLayout = (content: React.ReactNode) => (
    <main style={{ 
      maxWidth: 600, 
      margin: '3rem auto', 
      padding: 20,
      backgroundColor: 'transparent',
      minHeight: '400px' // Ensure consistent minimum height
    }}>
      <Card title="Draws" icon={<Icon name="shuffle" animate />}>
        <div style={{ minHeight: '100px' }}>
          {content}
        </div>
      </Card>
    </main>
  );

  // Loading state with consistent layout structure
  if (loading || isInitialRender) {
    return renderDrawsLayout(
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={48} />
        <div className="mt-4 text-muted" style={{ color: '#6b7280' }}>Loading draws…</div>
      </div>
    );
  }
  
  if (!allowed) return <Forbidden />;

  // Draws content
  const drawsContent = (
    <div>
      <p>View and upload draw results or analyze recent draws.</p>
    </div>
  );

  return renderDrawsLayout(drawsContent);
}

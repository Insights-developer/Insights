'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Prevent static generation
export const dynamic = 'force-dynamic';

type FeatureCardLink = {
  key: string;
  label: string;
  url: string;
  icon: string | null;
  order: number;
};

export default function AdminPage() {
  const router = useRouter();
  const [cardLinks, setCardLinks] = useState<FeatureCardLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before showing content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadData = async () => {
      try {
        // Only run in browser environment
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        // Import supabase only when needed
        const { supabase } = await import('@/utils/supabase/browser');
        const { appCache } = await import('../../utils/cache');

        const { data: auth } = await supabase.auth.getUser();
        if (!auth?.user) {
          router.replace('/');
          return;
        }

        const CACHE_KEY = 'admin-cards';
        const CACHE_DURATION = 30000; // 30 seconds cache for admin data

        // Check cache first
        const cachedData = appCache.get<FeatureCardLink[]>(CACHE_KEY);
        if (cachedData) {
          setCardLinks(cachedData);
          setLoading(false);
          return;
        }

        // Fetch dynamic admin cards/features
        const resp = await fetch('/api/user/cards');
        const cardsData = await resp.json();
        const cardData = Array.isArray(cardsData.cards) ? cardsData.cards : [];
        
        // Cache the result
        appCache.set(CACHE_KEY, cardData, CACHE_DURATION);
        setCardLinks(cardData);
      } catch (error) {
        console.error('Failed to fetch admin cards:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [mounted, router]);

  if (!mounted || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading admin dashboard…</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
        {cardLinks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {cardLinks.map(card => (
              <div key={card.key} className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="font-semibold mb-2">{card.label}</h3>
                <a 
                  href={card.url} 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Go to {card.label}
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500">
            <p>No admin features available</p>
          </div>
        )}
      </div>
    </div>
  );
}

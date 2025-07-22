'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import { appCache } from '../../utils/cache';
import PageLayout from '../components/ui/PageLayout';
import { usePageLoading } from '../components/ui/PageLayout';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

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
  const { showLoading, LoadingContent } = usePageLoading(mounted, loading);

  // Ensure component is mounted before showing content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
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

      try {
        // Fetch dynamic admin cards/features
        const resp = await fetch('/api/user/cards');
        const cardsData = await resp.json();
        const cardData = Array.isArray(cardsData.cards) ? cardsData.cards : [];
        
        // Cache the result
        appCache.set(CACHE_KEY, cardData, CACHE_DURATION);
        setCardLinks(cardData);
      } catch (error) {
        console.error('Failed to fetch admin cards:', error);
        // Use stale cache if available
        const staleData = appCache.get<FeatureCardLink[]>(CACHE_KEY);
        if (staleData) {
          setCardLinks(staleData);
        }
      }

      setLoading(false);
    })();
  }, [router]);

  if (showLoading) {
    return (
      <PageLayout title="Admin Dashboard" icon={<Icon name="user" animate />}>
        <LoadingContent>
          <Spinner size={48} />
          <div className="mt-4 text-gray-500">
            Loading admin dashboard…
          </div>
        </LoadingContent>
      </PageLayout>
    );
  }

  const content = cardLinks.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {cardLinks.map(card => (
        <Card 
          key={card.key} 
          title={card.label} 
          icon={card.icon ? 
            <img src={card.icon} alt="" className="w-7 h-7 object-contain" /> : 
            <Icon name="user" />
          }
        >
          <a 
            href={card.url} 
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Go to {card.label}
          </a>
        </Card>
      ))}
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
      <Icon name="user" className="mb-4" />
      <p>No admin features available</p>
    </div>
  );

  return (
    <PageLayout title="Admin Dashboard" icon={<Icon name="user" animate />}>
      {content}
    </PageLayout>
  );
}

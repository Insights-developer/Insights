'use client';

import { useEffect, useState } from 'react';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

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

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace('/');
        return;
      }

      // Add 2-second delay for testing spinner
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch dynamic admin cards/features
      const resp = await fetch('/api/user/cards');
      const cardsData = await resp.json();
      setCardLinks(Array.isArray(cardsData.cards) ? cardsData.cards : []);

      setLoading(false);
    })();
  }, [router]);

  // Loading state with consistent layout structure
  if (loading) {
    return (
      <main style={{ 
        maxWidth: 700, 
        margin: '2rem auto', 
        padding: 20,
        backgroundColor: 'transparent' // Let the app background show through
      }}>
        <Card title="Admin Dashboard" icon={<Icon name="user" animate />}>
          <div 
            className="flex flex-col items-center justify-center" 
            style={{ minHeight: '200px', padding: '2rem 0' }}
          >
            <Spinner size={48} />
            <div className="mt-4" style={{ fontSize: '16px', color: '#6b7280' }}>
              Loading admin dashboard…
            </div>
          </div>
        </Card>
      </main>
    );
  }

  return (
    <main style={{ 
      maxWidth: 700, 
      margin: '2rem auto', 
      padding: 20,
      backgroundColor: 'transparent' // Let the app background show through
    }}>
      <Card title="Admin Dashboard" icon={<Icon name="user" animate />}>
        <div style={{ minHeight: '200px' }}>
          {cardLinks.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              {cardLinks.map(card => (
                <li key={card.key} style={{ flex: '1 1 200px', minWidth: 200 }}>
                  <Card title={card.label} icon={card.icon ? <img src={card.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> : <Icon name="user" /> }>
                    <a href={card.url} style={{ textDecoration: 'none', color: '#0366d6', fontWeight: 500 }}>
                      Go to {card.label}
                    </a>
                  </Card>
                </li>
              ))}
            </ul>
          ) : (
            <div 
              className="flex flex-col items-center justify-center" 
              style={{ padding: '2rem 0', color: '#6b7280' }}
            >
              <Icon name="user" style={{ marginBottom: '1rem' }} />
              <p>No admin features available</p>
            </div>
          )}
        </div>
      </Card>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
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

      // Fetch dynamic admin cards/features
      const resp = await fetch('/api/user/cards');
      const cardsData = await resp.json();
      setCardLinks(Array.isArray(cardsData.cards) ? cardsData.cards : []);

      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading…</div>;

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 20 }}>
      <Card title="Admin Dashboard" icon={<Icon name="user" animate />}>
        {cardLinks.length > 0 && (
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
        )}
      </Card>
    </main>
  );
}

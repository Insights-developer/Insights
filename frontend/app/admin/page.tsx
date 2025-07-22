'use client';

import { useEffect, useState } from 'react';
import Card from '../components/ui/Cards';
import Button from '../components/ui/Buttons';
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

type UserMeta = {
  email: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMeta | null>(null);
  const [cardLinks, setCardLinks] = useState<FeatureCardLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace('/');
        return;
      }
      setUser({ email: auth.user.email ?? '' });

      // Fetch dynamic admin cards/features
      const resp = await fetch('/api/user/cards');
      const cardsData = await resp.json();
      setCardLinks(Array.isArray(cardsData.cards) ? cardsData.cards : []);

      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading…</div>;
  if (!user) return null;

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 20 }}>
      <Card title="Admin Dashboard" icon={<Icon name="user" animate />}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 14, color: '#555' }}>{user.email}</span>
          <Button
            variant="secondary"
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
            iconLeft={<Icon name="lock" />}
          >
            Sign Out
          </Button>
        </div>
        <h2 style={{ marginTop: 0 }}>Admin Cards</h2>
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

'use client';

import { useEffect, useState } from 'react';
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
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ marginRight: 12, fontSize: 14, color: '#555' }}>
            {user.email}
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <h1>Admin Dashboard</h1>

      {/* Dynamic Card Feature Links */}
      {cardLinks.length > 0 && (
        <section style={{ marginBottom: 28 }}>
          <h2>Admin Cards</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {cardLinks.map(card => (
              <li key={card.key} style={{ marginBottom: 14 }}>
                <a
                  href={card.url}
                  style={{
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: '#0366d6',
                  }}
                >
                  {card.icon && (
                    <img
                      src={card.icon}
                      alt=""
                      style={{ width: 25, height: 25, marginRight: 10, objectFit: 'contain', verticalAlign: 'middle' }}
                    />
                  )}
                  {card.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

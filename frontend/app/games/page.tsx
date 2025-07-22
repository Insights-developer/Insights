'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

export default function GamesPage() {
  const { allowed, loading } = useRequireFeature('games_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // Optionally show 403 component instead

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card title="Games" icon={<Icon name="lock" animate />}>
        <p>Welcome to the Games page. View or play lottery games here.</p>
        {/* ...your games page content... */}
      </Card>
    </main>
  );
}

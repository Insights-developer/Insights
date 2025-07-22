'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function GamesPage() {
  const { allowed, loading } = useRequireFeature('games_page');

  if (loading) return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size={48} />
          <div className="mt-4 text-muted">Loading games…</div>
        </div>
      </Card>
    </main>
  );
  
  if (!allowed) return <Forbidden />;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card title="Games" icon={<Icon name="gamepad" animate />}>
        <p>Welcome to the Games page. View or play lottery games here.</p>
        {/* ...your games page content... */}
      </Card>
    </main>
  );
}

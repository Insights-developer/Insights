'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

export default function ResultsPage() {
  const { allowed, loading } = useRequireFeature('results_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // or: return <div>Access denied.</div>;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card title="Results" icon={<Icon name="mail" animate />}>
        <p>Browse past draw results here.</p>
        {/* Your results content goes here */}
      </Card>
    </main>
  );
}

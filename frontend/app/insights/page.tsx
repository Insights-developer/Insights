'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

export default function InsightsPage() {
  const { allowed, loading } = useRequireFeature('insights_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // or <div>Access denied.</div>;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card title="Insights" icon={<Icon name="eye" animate />}>
        <p>Analyze draw patterns and trends here.</p>
        {/* Place your insights-related content here */}
      </Card>
    </main>
  );
}

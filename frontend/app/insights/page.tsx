'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

export default function InsightsPage() {
  const { allowed, loading } = useRequireFeature('insights_page');

  if (loading) return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size={48} />
          <div className="mt-4 text-muted">Loading…</div>
        </div>
      </Card>
    </main>
  );
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

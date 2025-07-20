'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

export default function InsightsPage() {
  const { allowed, loading } = useRequireFeature('insights_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // or <div>Access denied.</div>;

  return (
    <main>
      <h1>Insights Page</h1>
      {/* Place your insights-related content here */}
    </main>
  );
}

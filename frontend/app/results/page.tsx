'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

export default function ResultsPage() {
  const { allowed, loading } = useRequireFeature('results_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // or: return <div>Access denied.</div>;

  return (
    <main>
      <h1>Results Page</h1>
      {/* Your results content goes here */}
    </main>
  );
}

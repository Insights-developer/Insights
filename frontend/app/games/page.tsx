'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

export default function GamesPage() {
  const { allowed, loading } = useRequireFeature('games_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // Optionally show 403 component instead

  return (
    <main>
      <h1>Games Page</h1>
      {/* ...your games page content... */}
    </main>
  );
}

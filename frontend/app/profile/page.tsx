'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

export default function ProfilePage() {
  const { allowed, loading } = useRequireFeature('profile_page');

  if (loading) return <div>Loading…</div>;
  if (!allowed) return null; // Optionally show 403

  return (
    <main>
      <h1>Profile Page</h1>
      {/* ...profile management... */}
    </main>
  );
}

'use client';

import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Forbidden from '../components/Forbidden';

export default function ProfilePage() {
  const { allowed, loading, forbidden } = useRequireFeature('profile_page');

  if (loading) return <div>Loading profile…</div>;
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  // Replace with your profile details/editing component
  return (
    <main style={{ maxWidth: 500, margin: '3rem auto', textAlign: 'center' }}>
      <h1>Your Profile</h1>
      <p>Edit your details, manage your account, etc.</p>
      {/* ...profile form or info goes here... */}
    </main>
  );
}

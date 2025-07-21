'use client';

import { useRequireFeature } from '@/utils/hooks/useRequireFeature';
import Forbidden from '../components/Forbidden'; // (or your default forbidden page)

export default function ContactPage() {
  // Use the feature key matching your table for this page ("contact")
  const { allowed, loading, forbidden } = useRequireFeature('contact');

  if (loading) return <div>Loading…</div>;
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center', padding: 32 }}>
      <h1>Contact Us</h1>
      <p>
        This is your placeholder Contact page.<br />
        Add your contact information or a contact form here.
      </p>
      <div style={{ marginTop: 32, color: '#888' }}>
        <em>This page appears automatically if you add a <b>Contact</b> feature to your features list and assign access.</em>
      </div>
    </main>
  );
}

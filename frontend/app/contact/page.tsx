'use client';

import { useRequireFeature } from '@/utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden'; // (or your default forbidden page)

export default function ContactPage() {
  // Use the feature key matching your table for this page ("contact")
  const { allowed, loading, forbidden } = useRequireFeature('contact');

  if (loading) return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <Card>
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size={48} />
          <div className="mt-4 text-muted">Loading contact…</div>
        </div>
      </Card>
    </main>
  );
  
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  return (
    <main style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center', padding: 32 }}>
      <Card title="Contact Us" icon={<Icon name="mail" animate />}>
        <p>
          This is your placeholder Contact page.<br />
          Add your contact information or a contact form here.
        </p>
        <div style={{ marginTop: 32, color: '#888' }}>
          <em>This page appears automatically if you add a <b>Contact</b> feature to your features list and assign access.</em>
        </div>
      </Card>
    </main>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRequireFeature } from '@/utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden'; // (or your default forbidden page)

export default function ContactPage() {
  // Use the feature key matching your table for this page ("contact")
  const { allowed, loading, forbidden } = useRequireFeature('contact');
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Set initial render to false after component mounts
    setIsInitialRender(false);
  }, []);

  // Always render the main layout structure to prevent layout shifts
  const renderContactLayout = (content: React.ReactNode) => (
    <main style={{ 
      maxWidth: 600, 
      margin: '3rem auto', 
      textAlign: 'center', 
      padding: 32,
      backgroundColor: 'transparent',
      minHeight: '400px' // Ensure consistent minimum height
    }}>
      <Card title="Contact Us" icon={<Icon name="mail" animate />}>
        <div style={{ minHeight: '150px' }}>
          {content}
        </div>
      </Card>
    </main>
  );

  // Loading state with consistent layout structure
  if (loading || isInitialRender) {
    return renderContactLayout(
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={48} />
        <div className="mt-4 text-muted" style={{ color: '#6b7280' }}>Loading contact…</div>
      </div>
    );
  }
  
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  // Contact content
  const contactContent = (
    <div>
      <p>
        This is your placeholder Contact page.<br />
        Add your contact information or a contact form here.
      </p>
      <div style={{ marginTop: 32, color: '#888' }}>
        <em>This page appears automatically if you add a <b>Contact</b> feature to your features list and assign access.</em>
      </div>
    </div>
  );

  return renderContactLayout(contactContent);
}

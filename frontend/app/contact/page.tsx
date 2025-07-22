'use client';

import { useState, useEffect } from 'react';
import { useRequireFeature } from '@/utils/hooks/useRequireFeature';
import PageLayout, { usePageLoading } from '../components/ui/PageLayout';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function ContactPage() {
  const { allowed, loading, forbidden } = useRequireFeature('contact');
  const [mounted, setMounted] = useState(false);
  const { showLoading, LoadingContent } = usePageLoading(mounted, loading);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (showLoading) {
    return (
      <PageLayout title="Contact Us" icon={<Icon name="mail" animate />} maxWidth="md">
        <LoadingContent>
          <Spinner size={48} />
          <div className="mt-4 text-gray-500">Loading contact…</div>
        </LoadingContent>
      </PageLayout>
    );
  }
  
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  return (
    <PageLayout title="Contact Us" icon={<Icon name="mail" animate />} maxWidth="md">
      <div className="text-center space-y-6">
        <p className="text-gray-600">
          This is your placeholder Contact page.<br />
          Add your contact information or a contact form here.
        </p>
        <div className="bg-blue-50 p-6 rounded-lg">
          <p className="text-sm text-blue-600">
            <em>This page appears automatically if you add a <strong>Contact</strong> feature to your features list and assign access.</em>
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

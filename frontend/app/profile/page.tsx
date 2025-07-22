'use client';

import { useState, useEffect } from 'react';
import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import PageLayout, { usePageLoading } from '../components/ui/PageLayout';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function ProfilePage() {
  const { allowed, loading, forbidden } = useRequireFeature('profile_page');
  const [mounted, setMounted] = useState(false);
  const { showLoading, LoadingContent } = usePageLoading(mounted, loading);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (showLoading) {
    return (
      <PageLayout title="Your Profile" icon={<Icon name="settings" animate />} maxWidth="sm">
        <LoadingContent>
          <Spinner size={48} />
          <div className="mt-4 text-gray-500">Loading profile…</div>
        </LoadingContent>
      </PageLayout>
    );
  }
  
  if (forbidden) return <Forbidden />;
  if (!allowed) return null;

  return (
    <PageLayout title="Your Profile" icon={<Icon name="settings" animate />} maxWidth="sm">
      <div className="text-center space-y-6">
        <p className="text-gray-600">Edit your details, manage your account, etc.</p>
        {/* Profile form or info goes here */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <p className="text-sm text-gray-500">Profile management features coming soon...</p>
        </div>
      </div>
    </PageLayout>
  );
}

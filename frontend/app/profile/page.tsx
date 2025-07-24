'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import PageLayout from '../components/ui/PageLayout';
import Icon from '../components/ui/Icon';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export default function ProfilePage() {
  return (
    <FeatureGate feature="profile_page">
      <PageLayout title="Your Profile" icon={<Icon name="settings" animate />} maxWidth="sm">
        <div className="text-center space-y-6">
          <p className="text-gray-600">Edit your details, manage your account, etc.</p>
          {/* Profile form or info goes here */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-500">Profile management features coming soon...</p>
          </div>
        </div>
      </PageLayout>
    </FeatureGate>
  );
}

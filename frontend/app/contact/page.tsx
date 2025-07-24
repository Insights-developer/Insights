'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import PageLayout from '../components/ui/PageLayout';
import Icon from '../components/ui/Icon';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export default function ContactPage() {
  return (
    <FeatureGate feature="contact">
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
    </FeatureGate>
  );
}

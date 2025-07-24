'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import FeatureManagementClient from './FeatureManagementClient';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminFeaturesPage() {
  return (
    <FeatureGate feature="admin">
      <FeatureManagementClient />
    </FeatureGate>
  );
}

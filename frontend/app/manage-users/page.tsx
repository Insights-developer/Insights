'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import UserManagementClient from '../admin/users/UserManagementClient';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <FeatureGate feature="admin">
      <UserManagementClient />
    </FeatureGate>
  );
}


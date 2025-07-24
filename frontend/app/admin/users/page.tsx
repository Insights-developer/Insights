'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import UserManagementClient from './UserManagementClient';
import './styles.css';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

export default function UsersPage() {
  return (
    <FeatureGate feature="admin">
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-fade-in">
          <UserManagementClient />
        </div>
      </div>
    </FeatureGate>
  );
}

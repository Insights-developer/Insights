'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <FeatureGate feature="admin">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold mb-2">User Management</h3>
              <a 
                href="/manage-users" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Go to User Management
              </a>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold mb-2">Group Management</h3>
              <a 
                href="/admin/groups" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Go to Group Management
              </a>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border hover:bg-gray-100 transition-colors">
              <h3 className="font-semibold mb-2">Feature Management</h3>
              <a 
                href="/admin/features" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Go to Feature Management
              </a>
            </div>
          </div>
        </div>
      </div>
    </FeatureGate>
  );
}

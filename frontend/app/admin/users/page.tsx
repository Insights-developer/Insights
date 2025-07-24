// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

import UserManagementClient from './UserManagementClient';

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <UserManagementClient />
      </div>
    </div>
  );
}

// Force dynamic rendering to ensure fresh data
export const dynamic = 'force-dynamic';

import UserManagementClient from './UserManagementClient';
import './styles.css';

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="animate-fade-in">
        <UserManagementClient />
      </div>
    </div>
  );
}

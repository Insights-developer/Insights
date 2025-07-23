'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export const dynamic = 'force-dynamic';

interface Group {
  id: number;
  name: string;
}

interface UserProfile {
  id: string;
  email: string;
  current_login_at: string | null;
  groups: Group[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.from('users').select(`
          id,
          email,
          current_login_at,
          groups:access_groups (
            id,
            name
          )
        `);

        if (error) {
          throw error;
        }
        
        // The data from Supabase has a different shape than what the component expects.
        // We need to transform it to match the UserProfile interface.
        const transformedUsers = data.map((user: any) => ({
          ...user,
          groups: user.groups || [],
        }));

        setUsers(transformedUsers);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">User Management</h1>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">User Management</h1>
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Last Login</th>
                <th className="py-2 px-4 border-b">Groups</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-2 px-4 border-b">{user.email}</td>
                  <td className="py-2 px-4 border-b">
                    {user.current_login_at ? new Date(user.current_login_at).toLocaleString() : 'Never'}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {user.groups.map(group => group.name).join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

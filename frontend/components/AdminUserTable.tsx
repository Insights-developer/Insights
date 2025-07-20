'use client';
import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

export default function AdminUserTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then(({ users }) => setUsers(users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      {loading && <div>Loading users...</div>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{new Date(u.created_at).toLocaleString()}</td>
                <td>
                  {/* Add Promote/Demote and group management controls here */}
                  <button>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

'use client';

import { useEffect, useState } from 'react';

type User = { id: string; email: string };
type Group = { id: number; name: string };
type Assignment = { user_id: string; group_id: number };

export default function GroupMemberManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersRes = await fetch('/api/admin/users').then(r => r.json());
      const groupsRes = await fetch('/api/admin/groups').then(r => r.json());
      const assignmentsRes = await fetch('/api/admin/group-members').then(r => r.json());
      setUsers(Array.isArray(usersRes.users) ? usersRes.users : []);
      setGroups(Array.isArray(groupsRes.groups) ? groupsRes.groups : []);
      setAssignments(Array.isArray(assignmentsRes.memberships) ? assignmentsRes.memberships : []);
    } catch {
      setError('Failed to load users, groups, or assignments');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Add a user to a group
  async function handleAssign(userId: string, groupId: number) {
    await fetch('/api/admin/group-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, groupId }),
    });
    await fetchAll();
  }

  // Remove a user from a group
  async function handleRemove(userId: string, groupId: number) {
    await fetch('/api/admin/group-members', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, groupId }),
    });
    await fetchAll();
  }

  if (loading) return <div>Loading user/group assignments…</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <table style={{ width: '100%', marginTop: 16 }}>
      <thead>
        <tr>
          <th>User</th>
          <th>Groups</th>
          <th>Assign</th>
        </tr>
      </thead>
      <tbody>
        {users.map(user => {
          const userGroups = assignments
            .filter(a => a.user_id === user.id)
            .map(a => groups.find(g => g.id === a.group_id)?.name)
            .filter(Boolean)
            .join(', ');

          return (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                {userGroups || <em>None</em>}
                {assignments
                  .filter(a => a.user_id === user.id)
                  .map(a => (
                    <button
                      key={a.group_id}
                      style={{ marginLeft: 8, color: 'red' }}
                      onClick={() => handleRemove(user.id, a.group_id)}
                    >
                      Remove {groups.find(g => g.id === a.group_id)?.name}
                    </button>
                  ))}
              </td>
              <td>
                <select
                  defaultValue=""
                  onChange={e => {
                    const groupId = Number(e.target.value);
                    if (groupId) handleAssign(user.id, groupId);
                  }}
                >
                  <option value="">Add to group…</option>
                  {groups
                    .filter(g =>
                      !assignments.some(a => a.user_id === user.id && a.group_id === g.id)
                    )
                    .map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                </select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

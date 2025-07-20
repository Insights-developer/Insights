'use client';

import React, { useEffect, useState } from 'react';

type UserProfile = {
  id: string;
  email: string;
  role: string;
  created_at: string;
};

type AccessGroup = {
  id: number;
  name: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [memberships, setMemberships] = useState<{ [userId: string]: number[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/users').then(res => res.json()),
      fetch('/api/admin/groups').then(res => res.json()),
      fetch('/api/admin/group-members').then(res => res.json()),
    ]).then(([usersData, groupsData, membershipsData]) => {
      setUsers(Array.isArray(usersData.users) ? usersData.users : []);
      setGroups(Array.isArray(groupsData.groups) ? groupsData.groups : []);
      // Expected: membershipsData.memberships as { user_id, group_id }[]
      const membershipsObj: { [userId: string]: number[] } = {};
      (Array.isArray(membershipsData.memberships) ? membershipsData.memberships : []).forEach(
        (rel: { user_id: string; group_id: number }) => {
          if (!membershipsObj[rel.user_id]) membershipsObj[rel.user_id] = [];
          membershipsObj[rel.user_id].push(rel.group_id);
        }
      );
      setMemberships(membershipsObj);
      setError(null);
    }).catch(() => setError('Failed to load user data')).finally(() => setLoading(false));
  }, []);

  // Add/remove a user to/from a group
  const toggleMembership = async (userId: string, groupId: number) => {
    setLoading(true);
    const inGroup = memberships[userId]?.includes(groupId);
    const method = inGroup ? 'DELETE' : 'POST';
    const body = JSON.stringify({ userId, groupId });
    try {
      const res = await fetch('/api/admin/group-members', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) throw new Error();
      setMemberships(prev => {
        const current = prev[userId] || [];
        return {
          ...prev,
          [userId]: inGroup
            ? current.filter(id => id !== groupId)
            : [...current, groupId],
        };
      });
    } catch {
      setError('Failed to update membership');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: 20 }}>
      <h2>Manage Users and Group Assignments</h2>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Email</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Role</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Groups</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td style={{ padding: '4px 8px' }}>{user.email}</td>
              <td style={{ padding: '4px 8px' }}>{user.role}</td>
              <td style={{ padding: '4px 8px' }}>
                {groups.map(group => (
                  <label key={group.id} style={{ marginRight: 12 }}>
                    <input
                      type="checkbox"
                      disabled={loading}
                      checked={!!memberships[user.id]?.includes(group.id)}
                      onChange={() => toggleMembership(user.id, group.id)}
                    />
                    {group.name}
                  </label>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}

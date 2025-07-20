'use client';

import { useEffect, useState } from 'react';

// --- Types ---
type Group = {
  id: number;
  name: string;
};

type User = {
  id: string;
  email: string;
  username: string | null;
  phone: string | null;
  created_at: string;
  groups: Group[]; // Now required in user object!
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<User>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);

  function formatPhone(input: string) {
    return input.replace(/[^\d]/g, '');
  }

  // --- Fetch all users with their groups ---
  function fetchUsers() {
    setLoading(true);
    setError(null);
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
        else setError(data.error || 'Failed to load users');
      })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  }

  // --- Fetch all access groups ---
  function fetchGroups() {
    setGroupsLoading(true);
    fetch('/api/admin/groups')
      .then(res => res.json())
      .then(data => setAllGroups(data.groups || []))
      .finally(() => setGroupsLoading(false));
  }

  useEffect(fetchUsers, []);
  useEffect(fetchGroups, []);

  async function startEdit(u: User) {
    setEditId(u.id);
    setEdit({
      id: u.id,
      email: u.email,
      username: u.username ?? '',
      phone: u.phone ?? '',
      groups: u.groups || [],
    });
    setActionError(null);
  }

  async function cancelEdit() {
    setEditId(null);
    setEdit({});
    setActionError(null);
  }

  async function saveEdit(u: User) {
    setActionError(null);
    const payload: Record<string, any> = {
      userId: u.id,
      email: edit.email,
      username: edit.username?.trim() || null,
      phone: edit.phone ? formatPhone(edit.phone) : null,
      groupIds: Array.isArray(edit.groups)
        ? edit.groups.map((g: Group) => g.id)
        : [],
    };
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        setActionError(err.error || 'Failed to save user');
      } else {
        fetchUsers();
        cancelEdit();
      }
    } catch(e) {
      setActionError('Failed to update user');
    }
  }

  async function deleteUser(id: string) {
    if (!window.confirm('Delete this user? This is irreversible.')) return;
    setActionError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id })
      });
      if (!res.ok) {
        const err = await res.json();
        setActionError(err.error || 'Failed to delete user');
      } else {
        fetchUsers();
      }
    } catch(e) {
      setActionError('Failed to delete user');
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto', padding: 20 }}>
      <h2>Admin: Users Management</h2>
      <p>
        <small>
          <b>Access is now determined by group memberships only.</b>
          {` `}
          The legacy <code>role</code> field is not used; use groups to manage permissions.
        </small>
      </p>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {actionError && <div style={{ color: 'red', marginBottom: 12 }}>{actionError}</div>}
      {(loading || groupsLoading) ? (
        <div>Loading…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Groups</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                {/* EMAIL field */}
                <td>
                  {editId === u.id ? (
                    <input
                      value={edit.email ?? ''}
                      onChange={e => setEdit(edit => ({ ...edit, email: e.target.value }))}
                      style={{ width: '95%' }}
                      type="email"
                    />
                  ) : u.email}
                </td>
                {/* USERNAME */}
                <td>
                  {editId === u.id ? (
                    <input
                      value={edit.username ?? ''}
                      onChange={e => setEdit(edit => ({ ...edit, username: e.target.value }))}
                      style={{ width: '95%' }}
                    />
                  ) : (u.username || <em>(none)</em>)}
                </td>
                {/* PHONE */}
                <td>
                  {editId === u.id ? (
                    <input
                      value={edit.phone ?? ''}
                      onChange={e => {
                        const digits = e.target.value.replace(/[^\d]/g, '');
                        setEdit(edit => ({ ...edit, phone: digits }));
                      }}
                      style={{ width: '95%' }}
                      maxLength={15}
                      placeholder="digits only"
                    />
                  ) : (u.phone || <em>(none)</em>)}
                </td>
                {/* GROUPS */}
                <td>
                  {editId === u.id ? (
                    <select
                      multiple
                      style={{ width: '95%' }}
                      value={Array.isArray(edit.groups) ? edit.groups.map(g => String(g.id)) : []}
                      onChange={e => {
                        const selectedIds = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                        setEdit(edit => ({
                          ...edit,
                          groups: allGroups.filter(g => selectedIds.includes(g.id))
                        }));
                      }}
                    >
                      {allGroups.map(g => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    u.groups.map(g => g.name).join(', ') || <em>(none)</em>
                  )}
                </td>
                {/* CREATED AT */}
                <td>{new Date(u.created_at).toLocaleString()}</td>
                {/* ACTIONS */}
                <td>
                  {editId === u.id ? (
                    <>
                      <button onClick={() => saveEdit(u)}>Save</button>{' '}
                      <button onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(u)}>Edit</button>{' '}
                      <button onClick={() => deleteUser(u.id)} style={{ color: 'red' }}>
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

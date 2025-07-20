'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  role: string;
  username: string | null;
  phone: string | null;
  created_at: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<Partial<User>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  function formatPhone(input: string) {
    return input.replace(/[^\d]/g, '');
  }

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

  useEffect(fetchUsers, []);

  async function startEdit(u: User) {
    setEditId(u.id);
    setEdit({
      id: u.id,
      email: u.email,
      role: u.role,
      username: u.username ?? '',
      phone: u.phone ?? ''
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
      role: edit.role,
      username: edit.username?.trim() || null,
      phone: edit.phone ? formatPhone(edit.phone) : null
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
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {actionError && <div style={{ color: 'red', marginBottom: 12 }}>{actionError}</div>}
      {loading ? (
        <div>Loading users…</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Role</th>
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
                {/* ROLE */}
                <td>
                  {editId === u.id ? (
                    <select
                      value={edit.role ?? ''}
                      onChange={e => setEdit(edit => ({ ...edit, role: e.target.value }))}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      {/* Add other roles if needed */}
                    </select>
                  ) : u.role}
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

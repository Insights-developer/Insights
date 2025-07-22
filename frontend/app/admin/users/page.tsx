'use client';

import { useEffect, useState } from 'react';

// Prevent static generation
export const dynamic = 'force-dynamic';

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
  const [page, setPage] = useState(1);
  const pageSize = 6;
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

  // Pagination logic
  const totalPages = Math.ceil(users.length / pageSize);
  const pagedUsers = users.slice((page - 1) * pageSize, page * pageSize);

  return (
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>
        User Administration
      </h1>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {actionError && <div style={{ color: 'red', marginBottom: 12 }}>{actionError}</div>}
      {(loading || groupsLoading) ? (
        <div>Loading…</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {pagedUsers.map(u => (
            <div key={u.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[320px] flex-1">
              {/* Title with user icon */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 text-blue-500">👤</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{u.email}</h3>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Username:</b>{' '}
                {editId === u.id ? (
                  <input
                    value={edit.username ?? ''}
                    onChange={e => setEdit(edit => ({ ...edit, username: e.target.value }))}
                    style={{ width: '60%' }}
                  />
                ) : (u.username || <em>(none)</em>)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Phone:</b>{' '}
                {editId === u.id ? (
                  <input
                    value={edit.phone ?? ''}
                    onChange={e => {
                      const digits = e.target.value.replace(/[^\d]/g, '');
                      setEdit(edit => ({ ...edit, phone: digits }));
                    }}
                    style={{ width: '60%' }}
                    maxLength={15}
                    placeholder="digits only"
                  />
                ) : (u.phone || <em>(none)</em>)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Groups:</b>{' '}
                {u.groups.map(g => g.name).join(', ') || <em>(none)</em>}
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Created:</b> {new Date(u.created_at).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {editId === u.id ? (
                  <>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2" onClick={() => saveEdit(u)}>
                      🔒 Save
                    </button>
                    <button className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2" onClick={cancelEdit}>
                      👁️‍🗨️ Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1 rounded text-sm flex items-center gap-2" onClick={() => startEdit(u)}>
                      👁️ Edit
                    </button>
                    <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center gap-2" onClick={() => deleteUser(u.id)}>
                      🔒 Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 12 }}>
        <button className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Prev
        </button>
        <span style={{ alignSelf: 'center' }}>Page {page} of {totalPages}</span>
        <button className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-3 py-1 rounded text-sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </main>
  );
}

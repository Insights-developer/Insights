'use client';

import { useEffect, useState } from 'react';
import Card from '../../components/ui/Cards';
import Button from '../../components/ui/Buttons';
import Icon from '../../components/ui/Icon';

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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {pagedUsers.map(u => (
            <Card key={u.id} title={u.email} icon={<Icon name="user" animate />} className="min-w-[320px] flex-1">
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
                {editId === u.id ? (
                  <select
                    multiple
                    style={{ width: '60%' }}
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
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Created:</b> {new Date(u.created_at).toLocaleString()}
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {editId === u.id ? (
                  <>
                    <Button variant="primary" size="sm" iconLeft={<Icon name="lock" />} onClick={() => saveEdit(u)}>
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" iconLeft={<Icon name="eye-off" />} onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" iconLeft={<Icon name="eye" />} onClick={() => startEdit(u)}>
                      Edit
                    </Button>
                    <Button variant="danger" size="sm" iconLeft={<Icon name="lock" />} onClick={() => deleteUser(u.id)}>
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32, gap: 12 }}>
          <Button size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Prev
          </Button>
          <span style={{ alignSelf: 'center' }}>Page {page} of {totalPages}</span>
          <Button size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </main>
  );
}

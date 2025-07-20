'use client';

import React, { useEffect, useState } from 'react';

type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

export default function GroupsManager() {
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ name: string; description: string }>({ name: '', description: '' });
  const [saving, setSaving] = useState(false);

  // Fetch groups
  const fetchGroups = () => {
    setLoading(true);
    fetch('/api/admin/groups')
      .then((res) => res.json())
      .then((data) => {
        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setError(null);
      })
      .catch(() => setError('Failed to load groups'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchGroups, []);

  // Handle new group submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, description: form.description || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create group');
      }
      setForm({ name: '', description: '' });
      setShowForm(false);
      fetchGroups();
    } catch (e: any) {
      setError(e.message || 'Failed to create group');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h3>Access Groups</h3>
      <button onClick={() => setShowForm((v) => !v)} style={{ marginBottom: 12 }}>
        {showForm ? 'Cancel' : 'Add New Group'}
      </button>
      {showForm && (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: 12, marginBottom: 16 }}>
          <div>
            <label>
              Group Name:{' '}
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                required
                maxLength={50}
                style={{ marginRight: 8 }}
              />
            </label>
          </div>
          <div>
            <label>
              Description:{' '}
              <input
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                maxLength={100}
                style={{ marginRight: 8 }}
              />
            </label>
          </div>
          <button type="submit" disabled={saving}>Create</button>
        </form>
      )}
      {loading && <div>Loading groups…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ marginTop: 8 }}>
        {groups.map(group => (
          <li key={group.id} style={{ marginBottom: 10 }}>
            <strong>{group.name}</strong>
            <span style={{ color: '#999', marginLeft: 8 }}>{group.description}</span>
            {/* 
                Place edit/delete buttons here after PATCH/DELETE handlers are available.
                Will wire up next.
            */}
          </li>
        ))}
      </ul>
    </section>
  );
}

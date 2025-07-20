'use client';

import React, { useEffect, useState } from 'react';

type Feature = {
  id: number;
  key: string;
  name: string;
  description: string | null;
};

export default function FeaturesManager() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<{ key: string; name: string; description: string }>({ key: '', name: '', description: '' });
  const [editing, setEditing] = useState<Feature | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchFeatures = () => {
    setLoading(true);
    fetch('/api/admin/features')
      .then(res => res.json())
      .then(data => {
        setFeatures(Array.isArray(data.features) ? data.features : []);
        setError(null);
      })
      .catch(() => setError('Failed to load features'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchFeatures, []);

  const resetForm = () => {
    setEditing(null);
    setForm({ key: '', name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const method = editing ? 'PATCH' : 'POST';
      const body = editing
        ? JSON.stringify({ key: editing.key, name: form.name, description: form.description })
        : JSON.stringify({ key: form.key, name: form.name, description: form.description });

      const res = await fetch('/api/admin/features', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save feature');
      }
      resetForm();
      fetchFeatures();
    } catch (e: any) {
      setError(e.message || 'Failed to save feature');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (f: Feature) => {
    setEditing(f);
    setForm({ key: f.key, name: f.name, description: f.description || '' });
  };

  const handleDelete = async (feature: Feature) => {
    if (!window.confirm(`Delete feature "${feature.name}"? This action is irreversible.`)) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/features', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: feature.key }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete feature');
      }
      fetchFeatures();
      resetForm();
    } catch (e: any) {
      setError(e.message || 'Failed to delete feature');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h3>System Features</h3>
      <form onSubmit={handleSubmit} style={{ border: '1px solid #eee', padding: 12, marginBottom: 16 }}>
        <div>
          <label>
            Key:{' '}
            <input
              value={form.key}
              disabled={!!editing}
              onChange={e => setForm(f => ({ ...f, key: e.target.value }))}
              required
              maxLength={100}
              pattern="^[a-zA-Z0-9_-]+$"
              title="letters, numbers, dash or underscore only"
              style={{ marginRight: 8 }}
            />
          </label>
        </div>
        <div>
          <label>
            Name:{' '}
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              maxLength={100}
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
              maxLength={255}
            />
          </label>
        </div>
        <button type="submit" disabled={saving}>
          {editing ? 'Save Changes' : 'Add Feature'}
        </button>
        {editing && (
          <button type="button" onClick={resetForm} disabled={saving} style={{ marginLeft: 8 }}>
            Cancel
          </button>
        )}
      </form>
      {loading && <div>Loading…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ marginTop: 8 }}>
        {features.map(feature => (
          <li key={feature.key} style={{ marginBottom: 6 }}>
            <strong>{feature.name}</strong>
            <span style={{ color: '#888', marginLeft: 6 }}>({feature.key})</span>
            {feature.description && <span style={{ marginLeft: 8 }}>{feature.description}</span>}
            <button style={{ marginLeft: 12 }} onClick={() => startEdit(feature)} disabled={saving}>
              Edit
            </button>
            <button style={{ marginLeft: 4, color: 'red' }} onClick={() => handleDelete(feature)} disabled={saving}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

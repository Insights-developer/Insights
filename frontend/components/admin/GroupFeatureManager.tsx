'use client';

import { useEffect, useState } from 'react';

type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

type Feature = {
  id: number;
  key: string;
  name: string;
  description: string | null;
};

type GroupFeatureManagerProps = {
  group: AccessGroup;
  allFeatures: Feature[];
};

export default function GroupFeatureManager({ group, allFeatures }: GroupFeatureManagerProps) {
  const [assignedFeatureKeys, setAssignedFeatureKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/group-features?groupId=${group.id}`);
      const data = await res.json();
      if (Array.isArray(data.features)) {
        setAssignedFeatureKeys(data.features);
      } else {
        setAssignedFeatureKeys([]);
      }
    } catch {
      setErr('Failed to load group features.');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (group?.id) {
      fetchAssignments();
    }
  }, [group?.id]);

  async function addFeature(key: string) {
    setLoading(true);
    const resp = await fetch('/api/admin/group-features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id, feature: key }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      setErr(errorData.error || 'Failed to add feature');
    } else {
      setErr(null);
      await fetchAssignments();
    }
    setLoading(false);
  }

  async function removeFeature(key: string) {
    setLoading(true);
    const resp = await fetch('/api/admin/group-features', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id, feature: key }),
    });
    if (!resp.ok) {
      const errorData = await resp.json();
      setErr(errorData.error || 'Failed to remove feature');
    } else {
      setErr(null);
      await fetchAssignments();
    }
    setLoading(false);
  }

  const notAssigned = allFeatures.filter(f => !assignedFeatureKeys.includes(f.key));
  const assigned = allFeatures.filter(f => assignedFeatureKeys.includes(f.key));

  return (
    <div>
      <h4>
        Features for <em>{group.name}</em>
      </h4>
      {err && <div style={{ color: 'red' }}>{err}</div>}
      {loading && <div>Loading features…</div>}

      <table style={{ width: '100%', marginTop: 16 }}>
        <thead>
          <tr>
            <th>Key</th>
            <th>Name</th>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {assigned.length === 0 && (
            <tr>
              <td colSpan={4}>
                <em>No features assigned to this group.</em>
              </td>
            </tr>
          )}
          {assigned.map(f => (
            <tr key={f.key}>
              <td>{f.key}</td>
              <td>{f.name}</td>
              <td>{f.description}</td>
              <td>
                <button onClick={() => removeFeature(f.key)} disabled={loading}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 24 }}>
        <h5>Add feature to group:</h5>
        <select
          disabled={notAssigned.length === 0 || loading}
          defaultValue=""
          onChange={e => {
            const k = e.target.value;
            if (k) addFeature(k);
            e.target.value = '';
          }}
        >
          <option value="">Select feature…</option>
          {notAssigned.map(f => (
            <option key={f.key} value={f.key}>
              {f.name} ({f.key})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

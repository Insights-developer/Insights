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

  // Fetch the current assignment for the selected group
  const fetchAssignments = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/group-features?group_id=${group.id}`);
      const data = await res.json();
      if (Array.isArray(data.featureKeys)) {
        setAssignedFeatureKeys(data.featureKeys);
      } else if (Array.isArray(data.features)) {
        // Accept fallback under earlier APIs
        setAssignedFeatureKeys(
          data.features.map((f: any) => typeof f === 'string' ? f : f.key)
        );
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
    // eslint-disable-next-line
  }, [group?.id]);

  // Assign feature
  async function addFeature(key: string) {
    setLoading(true);
    await fetch('/api/admin/group-features', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id, featureKey: key }),
    });
    await fetchAssignments();
  }

  // Remove feature from group
  async function removeFeature(key: string) {
    setLoading(true);
    await fetch('/api/admin/group-features', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupId: group.id, featureKey: key }),
    });
    await fetchAssignments();
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

      {/* Assigned features */}
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

      {/* Features that can be added */}
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

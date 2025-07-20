'use client';

import React, { useState, useEffect } from 'react';

type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

type FeatureState = {
  [feature: string]: boolean;
};

type Props = {
  group: AccessGroup;
  allFeatures: string[];  // List of all possible features in your system
};

export default function GroupFeatureManager({ group, allFeatures }: Props) {
  const [features, setFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load assigned features on mount & when group changes
  useEffect(() => {
    let aborted = false;
    setLoading(true);
    fetch(`/api/admin/group-features?groupId=${group.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (!aborted) {
          setFeatures(Array.isArray(data.features) ? data.features : []);
          setError(null);
        }
      })
      .catch((e) => setError('Failed to load features'))
      .finally(() => setLoading(false));
    return () => { aborted = true; };
  }, [group.id]);

  const handleToggle = async (feature: string) => {
    setLoading(true);
    setError(null);
    const enabled = features.includes(feature);
    const method = enabled ? 'DELETE' : 'POST';
    const body = JSON.stringify({ groupId: group.id, feature });
    try {
      const res = await fetch('/api/admin/group-features', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Request failed');
      }
      setFeatures((prev) =>
        enabled ? prev.filter((f) => f !== feature) : [...prev, feature]
      );
    } catch (e: any) {
      setError(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Feature Permissions for {group.name}</h3>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        {allFeatures.map((feature) => (
          <li key={feature}>
            <label>
              <input
                type="checkbox"
                checked={features.includes(feature)}
                disabled={loading}
                onChange={() => handleToggle(feature)}
              />
              {feature}
            </label>
          </li>
        ))}
      </ul>
      {loading && <div>Saving…</div>}
    </div>
  );
}

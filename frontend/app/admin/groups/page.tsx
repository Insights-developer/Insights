'use client';

import React, { useEffect, useState } from 'react';

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
  type?: string;
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<AccessGroup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch all groups
  const fetchGroups = () => {
    setLoading(true);
    fetch('/api/admin/groups')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.groups)) {
          setGroups(data.groups);
          if (
            !selectedGroup ||
            !data.groups.some((g: AccessGroup) => g.id === selectedGroup.id)
          ) {
            setSelectedGroup(data.groups[0] || null);
          }
          setError(null);
        } else {
          setError('Failed to load groups.');
        }
      })
      .catch(() => setError('Failed to load groups.'))
      .finally(() => setLoading(false));
  };

  // Fetch all features
  const fetchFeatures = () => {
    fetch('/api/admin/features')
      .then(res => res.json())
      .then(data => {
        setFeatures(Array.isArray(data.features) ? data.features : []);
      });
  };

  useEffect(fetchGroups, []);
  useEffect(fetchFeatures, []);

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: 20, display: 'flex', flexWrap: 'wrap', gap: 32 }}>
      <div style={{ flex: '1 1 340px', minWidth: 340 }}>
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Groups</h2>
          <div>GroupsManager component would go here</div>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Assign Users to Groups</h2>
          <div>GroupMemberManager component would go here</div>
        </div>
      </div>
      <div style={{ flex: '2 1 500px', minWidth: 400, display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Set Feature Permissions for a Group</h2>
          {loading && <div>Loading groups…</div>}
          {!loading && groups.length === 0 && <div>No groups defined yet.</div>}
          {groups.length > 0 && (
            <>
              <label>
                <strong>Select group: </strong>
                <select
                  value={selectedGroup?.id ?? ''}
                  onChange={e => {
                    const id = Number(e.target.value);
                    setSelectedGroup(groups.find(g => g.id === id) ?? null);
                  }}
                  style={{ marginLeft: 8 }}
                >
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </label>
              <div>GroupFeatureManager component would go here</div>
            </>
          )}
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">System Features</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {features.map(f => {
              return (
                <div key={f.key} className="bg-gray-50 p-4 rounded-lg border min-w-[180px] flex-1">
                  <h3 className="font-semibold mb-2">{f.name}</h3>
                  <div style={{ fontSize: 13, color: '#555' }}>{f.description}</div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Type: {f.type || 'feature'}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}

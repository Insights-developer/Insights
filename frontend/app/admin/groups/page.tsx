'use client';

import React, { useEffect, useState } from 'react';
import GroupsManager from '@/components/admin/GroupsManager';
import GroupFeatureManager from '@/components/admin/GroupFeatureManager';
import FeaturesManager from '@/components/admin/FeaturesManager';
import GroupMemberManager from '@/components/admin/GroupMemberManager';

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
    <main style={{ maxWidth: 900, margin: '2rem auto', padding: 20 }}>
      <h2>Manage Groups & Features</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}

      {/* Group CRUD component */}
      <GroupsManager />

      {/* Assign users to groups */}
      <section style={{ marginTop: 40 }}>
        <h3>Assign Users to Groups</h3>
        <GroupMemberManager />
      </section>

      {/* Assign features to groups */}
      <section style={{ marginTop: 40 }}>
        <h3>Set Feature Permissions for a Group</h3>
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
              >
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedGroup && (
              <div style={{ marginTop: 24 }}>
                <GroupFeatureManager group={selectedGroup} allFeatures={features} />
              </div>
            )}
          </>
        )}
      </section>

      {/* Global Features Manager */}
      <section style={{ marginTop: 60 }}>
        <FeaturesManager />
      </section>
    </main>
  );
}

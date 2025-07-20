'use client';
import { useEffect, useState } from 'react';

type Group = {
  id: number;
  name: string;
  description: string | null;
};

export default function AdminGroupTable() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/groups')
      .then((res) => res.json())
      .then(({ groups }) => setGroups(groups || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section>
      {loading && <div>Loading groups...</div>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <tr key={g.id}>
                <td>{g.name}</td>
                <td>{g.description}</td>
                <td>{g.id}</td>
                <td>
                  {/* Add group editing and deletion here */}
                  <button>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

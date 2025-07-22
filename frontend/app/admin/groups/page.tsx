'use client';

import React, { useEffect, useState } from 'react';

// Prevent static generation
export const dynamic = 'force-dynamic';

type AccessGroup = {
  id: number;
  name: string;
  description: string | null;
};

export default function GroupsPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Groups page mounted');
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: '2rem auto', padding: 20 }}>
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Admin Groups</h2>
        <p>Groups management will be implemented here.</p>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {loading && <div>Loading...</div>}
      </div>
    </main>
  );
}

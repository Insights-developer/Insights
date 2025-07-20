'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';

type UserMeta = {
  email: string;
  features: string[];
};

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.replace('/');
        return;
      }

      // You can fetch features via your own API (recommended, supports future RBAC complexity):
      // Example: /api/admin/user-features?userId=auth.user.id
      // Here, we'll fetch email and features from users+join tables directly:
      const { data: userData, error } = await supabase
        .from('users')
        .select('email, user_access_groups: user_access_groups (access_group: access_groups (access_group_features: access_group_features (feature)))')
        .eq('id', auth.user.id)
        .single();

      if (!userData || error) {
        router.replace('/');
        return;
      }

      // Flatten all features assigned via group membership
      const features = Array.from(
        new Set(
          (userData.user_access_groups || [])
            .flatMap((uag: any) =>
              uag.access_group?.access_group_features?.map((f: any) => f.feature) || []
            )
        )
      );

      if (!features.includes('admin_dashboard')) {
        // Not an admin by RBAC permissions
        router.replace('/');
        return;
      }

      setUser({ email: userData.email, features });
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div>Loading…</div>;
  if (!user) return null; // Redirected

  return (
    <main style={{ maxWidth: 700, margin: '2rem auto', padding: 20 }}>
      <header style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ marginRight: 12, fontSize: 14, color: '#555' }}>
            {user.email}
          </span>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      <h1>Admin Dashboard</h1>
      <ul style={{ lineHeight: 2, fontSize: 18 }}>
        <li>
          <a href="/admin/users">Manage Users</a>
        </li>
        <li>
          <a href="/admin/groups">Manage Groups &amp; Features</a>
        </li>
      </ul>
    </main>
  );
}

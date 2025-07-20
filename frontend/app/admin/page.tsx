// /frontend/app/admin/page.tsx

import Link from 'next/link';

export default function AdminPage() {
  return (
    <main style={{ maxWidth: 600, margin: '2rem auto', padding: 20 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin. Use the tools below to manage users, groups, and permissions.</p>
      <ul style={{ lineHeight: 2, fontSize: 18 }}>
        <li>
          <Link href="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/groups">Manage Groups &amp; Features</Link>
        </li>
      </ul>
    </main>
  );
}

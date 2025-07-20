import Link from 'next/link';

export default function AdminPage() {
  return (
    <main>
      <h2>Admin Dashboard</h2>
      <ul>
        <li>
          <Link href="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/groups">Manage Groups</Link>
        </li>
      </ul>
    </main>
  );
}

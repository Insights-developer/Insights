import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AdminCard href="/admin/access-groups" title="Access Groups" desc="Manage user access groups and permissions." />
        <AdminCard href="/admin/features" title="Features" desc="Manage app features and feature access." />
        <AdminCard href="/admin/users" title="Users" desc="View and manage users." />
        <AdminCard href="/admin/app-config" title="App Config" desc="Configure application settings." />
      </div>
    </div>
  );
}

function AdminCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block bg-white rounded-xl shadow hover:shadow-lg border border-[var(--card-border)] p-6 transition-all group">
      <h2 className="text-xl font-semibold mb-2 group-hover:text-[var(--primary)]">{title}</h2>
      <p className="text-gray-600">{desc}</p>
    </Link>
  );
}

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="w-full bg-gray-100 py-4 px-8 flex justify-center gap-8 shadow-sm">
      <Link href="/dashboard" className="font-semibold hover:underline">Dashboard</Link>
      <Link href="/insights" className="font-semibold hover:underline">Insights</Link>
      <Link href="/settings" className="font-semibold hover:underline">Settings</Link>
    </nav>
  );
}

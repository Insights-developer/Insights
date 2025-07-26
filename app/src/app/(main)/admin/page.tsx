import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  let userEmail = "";
  let isAdmin = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) throw new Error("No token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    userEmail = typeof decoded === 'object' && decoded.email ? decoded.email : "";
    isAdmin = typeof decoded === 'object' && decoded.role === "admin";
  } catch {
    redirect("/");
  }
  if (!isAdmin) redirect("/dashboard");
  return (
    <div
      className="max-w-2xl mx-auto mt-20 p-8 rounded shadow text-center"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
    >
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Admin Panel</h1>
      <p className="mb-2">Welcome, <span className="font-semibold">{userEmail}</span>!</p>
      <div className="flex flex-col gap-4 mt-8">
        <Link href="/admin/users" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>Manage Users</Link>
        <Link href="/admin/access-groups" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>Manage Access Groups</Link>
      </div>
    </div>
  );
}

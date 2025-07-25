import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  // Server-side check for JWT and role (for demo, not secure for production)
  let userEmail = "";
  let isAdmin = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) throw new Error("No token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-expect-error Server component needs async cookies
    userEmail = decoded.email;
    // @ts-expect-error Server component needs async cookies
    isAdmin = decoded.role === "admin";
  } catch {
    redirect("/");
  }
  if (!isAdmin) redirect("/dashboard");
  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
      <p className="mb-2">Welcome, <span className="font-semibold">{userEmail}</span>!</p>
      <div className="flex flex-col gap-4 mt-8">
        <Link href="/admin/users" className="text-blue-600 underline">Manage Users</Link>
        <Link href="/admin/access-groups" className="text-blue-600 underline">Manage Access Groups</Link>
      </div>
    </div>
  );
}

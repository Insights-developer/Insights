import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  // Server-side check for JWT and role (for demo, not secure for production)
  let isAdmin = false;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) throw new Error("No token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-expect-error Server component needs async cookies
    isAdmin = decoded.role === "admin";
  } catch {
    redirect("/");
  }
  if (!isAdmin) redirect("/dashboard");
  // TODO: Fetch users from API and display/edit
  return (
    <div className="max-w-3xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      <p className="mb-2">(User management UI coming soon)</p>
    </div>
  );
}

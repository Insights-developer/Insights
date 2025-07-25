import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Server-side check for JWT (for demo, not secure for production)
  let userEmail = "";
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) throw new Error("No token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-expect-error Server component needs async cookies
    userEmail = decoded.email;
  } catch {
    redirect("/");
  }
  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">Welcome, <span className="font-semibold">{userEmail}</span>!</p>
      <p className="text-gray-600">This is your dashboard. More features coming soon.</p>
    </div>
  );
}

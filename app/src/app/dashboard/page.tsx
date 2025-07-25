"use client";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (typeof user === "undefined") return; // still loading
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  if (typeof user === "undefined") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect
  }

  // Debug: log the user object to inspect its structure
  if (typeof window !== "undefined") {
    console.log("Stack Auth user object:", user);
  }

  // Safely extract email or fallback
  function getUserEmail(u: unknown): string {
    if (!u || typeof u !== "object") return "Unknown";
    // Try common property names
    if ("email" in u && typeof (u as Record<string, unknown>)["email"] === "string") {
      return (u as Record<string, string>)["email"];
    }
    if ("data" in u && typeof (u as Record<string, unknown>)["data"] === "object" && (u as Record<string, unknown>)["data"] !== null) {
      const data = (u as Record<string, unknown>)["data"] as Record<string, unknown>;
      if (typeof data.email === "string") return data.email;
    }
    if ("username" in u && typeof (u as Record<string, unknown>)["username"] === "string") {
      return (u as Record<string, string>)["username"];
    }
    return "Unknown";
  }
  const email = getUserEmail(user);

  return (
    <div className="max-w-2xl mx-auto mt-20 p-8 bg-white rounded shadow text-center">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-2">Welcome, <span className="font-semibold">{email}</span>!</p>
      <p className="text-gray-600">This is your dashboard. More features coming soon.</p>
    </div>
  );
}

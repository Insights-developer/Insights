"use client";
import React from "react";
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

  return (
    <div className="max-w-3xl mx-auto mt-16 p-10 bg-white rounded-2xl shadow-xl text-center border border-gray-100">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Dashboard</h1>
      <p className="mb-4 text-lg text-gray-700">Welcome to your dashboard. Use the sidebar to navigate through the app features.</p>
      <div className="mt-8 text-gray-500">More features coming soon.</div>
    </div>
  );
}

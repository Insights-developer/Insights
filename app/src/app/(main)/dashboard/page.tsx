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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto" style={{ borderColor: 'var(--primary)', borderBottomColor: 'var(--primary-dark)' }}></div>
          <p className="mt-4" style={{ color: 'var(--gray)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // will redirect
  }

  return (
    <div
      className="max-w-3xl mx-auto mt-16 p-10 rounded-2xl shadow-xl text-center"
      style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
    >
      <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Dashboard</h1>
      <p className="mb-4 text-lg" style={{ color: 'var(--gray-dark)' }}>Welcome to your dashboard. Use the sidebar to navigate through the app features.</p>
      <div className="mt-8" style={{ color: 'var(--gray)' }}>More features coming soon.</div>
    </div>
  );
}

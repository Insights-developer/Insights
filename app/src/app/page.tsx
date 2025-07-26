"use client";


import AuthFormSuspense from "@/components/AuthFormSuspense";
import Link from "next/link";
import { useEffect } from "react";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function Home() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "HomePage",
      timestamp: new Date().toISOString(),
      info: { message: "Home page loaded" },
    });
  }, [reportDebugInfo]);
  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <AuthFormSuspense />
    </main>
  );
}

"use client";
import { useEffect } from "react";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function InsightsPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "InsightsPage",
      timestamp: new Date().toISOString(),
      info: { message: "Insights page loaded" },
    });
  }, [reportDebugInfo]);
  return (
    <div
      className="max-w-2xl mx-auto mt-20 p-8 rounded-3xl shadow-2xl text-center"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        color: 'var(--foreground)',
      }}
    >
      <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Insights</h1>
      <p className="mb-2">Your analytics and insights will appear here.</p>
      <p style={{ color: 'var(--gray)' }}>(Feature coming soon)</p>
    </div>
  );
}

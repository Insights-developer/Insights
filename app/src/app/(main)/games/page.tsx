"use client";

import React, { useEffect } from "react";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function GamesPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "GamesPage",
      timestamp: new Date().toISOString(),
      info: { message: "Games page loaded" },
    });
  }, [reportDebugInfo]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-8 px-2 sm:px-4 lg:px-8">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--card-border)] p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-[var(--primary-dark)]">Games</h1>
        <p className="mb-2">Welcome to the Games section. More features coming soon!</p>
      </div>
    </div>
  );
}

"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export type DebugEntry = {
  source: string;
  timestamp: string;
  info: Record<string, unknown> | string;
};

type DebugInfoContextType = {
  debugEntries: DebugEntry[];
  reportDebugInfo: (entry: DebugEntry) => void;
  clearDebugInfo: () => void;
};


const DebugInfoContext = createContext<DebugInfoContextType | undefined>(undefined);

export function DebugInfoProvider({ children }: { children: React.ReactNode }) {
  const [debugEntries, setDebugEntries] = useState<DebugEntry[]>([]);
  const pathname = usePathname();

  const reportDebugInfo = (entry: DebugEntry) => {
    setDebugEntries((prev) => [...prev, entry]);
  };

  const clearDebugInfo = () => setDebugEntries([]);

  // Clear debug info whenever the route changes
  useEffect(() => {
    setDebugEntries([]);
  }, [pathname]);

  return (
    <DebugInfoContext.Provider value={{ debugEntries, reportDebugInfo, clearDebugInfo }}>
      {children}
    </DebugInfoContext.Provider>
  );
}

export function useDebugInfo() {
  const ctx = useContext(DebugInfoContext);
  if (!ctx) throw new Error("useDebugInfo must be used within a DebugInfoProvider");
  return ctx;
}

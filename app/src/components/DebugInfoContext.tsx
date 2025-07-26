import React, { createContext, useContext, useState } from "react";

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

  const reportDebugInfo = (entry: DebugEntry) => {
    setDebugEntries((prev) => [...prev, entry]);
  };

  const clearDebugInfo = () => setDebugEntries([]);

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

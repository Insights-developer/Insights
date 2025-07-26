"use client";

import { StackProvider } from "@stackframe/stack";
import { stackApp } from "@/lib/stack-client";
import { DebugInfoProvider } from "./DebugInfoContext";

export default function StackAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackApp}>
      <DebugInfoProvider>
        {children}
      </DebugInfoProvider>
    </StackProvider>
  );
}

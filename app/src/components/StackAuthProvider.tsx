"use client";

import { StackProvider } from "@stackframe/stack";
import { stackApp } from "@/lib/stack-client";

export default function StackAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackApp}>
      {children}
    </StackProvider>
  );
}

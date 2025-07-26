"use client";
import React, { useEffect } from "react";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function UsersPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "UsersAdminPage",
      timestamp: new Date().toISOString(),
      info: { message: "Users admin page loaded" },
    });
  }, [reportDebugInfo]);
  return <div>Users admin page coming soon.</div>;
}

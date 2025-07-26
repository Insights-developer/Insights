"use client";
import React, { useEffect } from "react";
import AccessGroupsManager from "./AccessGroupsManager";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function AccessGroupsPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "AccessGroupsAdminPage",
      timestamp: new Date().toISOString(),
      info: { message: "Access Groups admin page loaded" },
    });
  }, [reportDebugInfo]);
  return <AccessGroupsManager />;
}

"use client";
import React, { useEffect } from "react";
import AppConfigManager from "./AppConfigManager";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function AppConfigPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "AppConfigPage",
      timestamp: new Date().toISOString(),
      info: { message: "App Config page loaded" },
    });
  }, [reportDebugInfo]);
  return <AppConfigManager />;
}
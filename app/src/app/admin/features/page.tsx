"use client";
import React, { useEffect } from "react";
import FeaturesManager from "./FeaturesManager";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function FeaturesPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "FeaturesAdminPage",
      timestamp: new Date().toISOString(),
      info: { message: "Features admin page loaded" },
    });
  }, [reportDebugInfo]);
  return <FeaturesManager />;
}

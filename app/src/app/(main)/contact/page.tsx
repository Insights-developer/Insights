"use client";

import React, { useEffect } from "react";
import { useDebugInfo } from "@/components/DebugInfoContext";

export default function ContactPage() {
  const { reportDebugInfo } = useDebugInfo();
  useEffect(() => {
    reportDebugInfo({
      source: "ContactPage",
      timestamp: new Date().toISOString(),
      info: { message: "Contact page loaded" },
    });
  }, [reportDebugInfo]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-8 px-2 sm:px-4 lg:px-8">
      <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--card-border)] p-8 max-w-lg w-full text-center">
        <h1 className="text-2xl font-bold mb-4 text-[var(--primary-dark)]">Contact</h1>
        <p className="mb-2">
          For support or inquiries, please email{' '}
          <a href="mailto:support@example.com" className="text-[var(--primary-dark)] underline">support@example.com</a>.
        </p>
        <p>We will get back to you as soon as possible.</p>
      </div>
    </div>
  );
}

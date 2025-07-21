'use client';

import React from 'react';

export default function Notification({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#ffc", padding: 12, borderRadius: 6 }}>
      {children}
    </div>
  );
}

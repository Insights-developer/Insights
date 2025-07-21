'use client';

import React from 'react';

export default function Avatar({ src, name }: { src?: string, name: string }) {
  if (src) return (
    <img
      src={src}
      alt={name}
      style={{ width: 36, height: 36, borderRadius: "50%" }}
    />
  );
  // Initials fallback
  const initials = name
    .split(/\s+/)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "#eee",
        color: "#333",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold"
      }}
    >
      {initials}
    </div>
  );
}

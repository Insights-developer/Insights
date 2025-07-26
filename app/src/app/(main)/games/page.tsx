import React from "react";

export default function GamesPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Games</h1>
      <div
        className="rounded-lg shadow p-6 max-w-lg mx-auto"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
      >
        <p className="mb-2">Welcome to the Games section. More features coming soon!</p>
      </div>
    </div>
  );
}

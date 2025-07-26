import React from "react";

export default function ContactPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>Contact</h1>
      <div
        className="rounded-lg shadow p-6 max-w-lg mx-auto"
        style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', color: 'var(--foreground)' }}
      >
        <p className="mb-2">
          For support or inquiries, please email{' '}
          <a href="mailto:support@example.com" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>support@example.com</a>.
        </p>
        <p>We will get back to you as soon as possible.</p>
      </div>
    </div>
  );
}

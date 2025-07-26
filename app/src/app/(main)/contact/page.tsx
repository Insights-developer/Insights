import React from "react";

export default function ContactPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Contact</h1>
      <div className="bg-white rounded-lg shadow p-6 max-w-lg mx-auto">
        <p className="mb-2">For support or inquiries, please email <a href="mailto:support@example.com" className="text-blue-600 underline">support@example.com</a>.</p>
        <p>We will get back to you as soon as possible.</p>
      </div>
    </div>
  );
}

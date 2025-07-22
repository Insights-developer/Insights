'use client';

import { useEffect, useState } from 'react';

// Prevent static generation
export const dynamic = 'force-dynamic';

export default function AdminFeaturesPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Feature Management</h1>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Feature Administration</h3>
            <p className="text-gray-600">Feature management tools will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

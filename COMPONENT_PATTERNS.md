# Insights App Component Patterns

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: Production Ready - Session Management Patterns Added (July 24, 2025)  

## 🔐 NEW: Centralized Session Management Patterns
**Updated July 24, 2025 - Use these patterns for all new components**

### ✅ AuthContext Usage Pattern
```tsx
'use client';
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const auth = useAuth();
  
  // Check initialization
  if (!auth.initialized) {
    return <div>Loading...</div>;
  }
  
  // Check authentication
  if (!auth.user) {
    return <LoginPrompt />;
  }
  
  // Check permissions
  if (!auth.hasFeature('required_feature')) {
    return <AccessDenied />;
  }
  
  return <AuthenticatedContent />;
}
```

### ✅ API Client Usage Pattern  
```tsx
'use client';
import { useApiClient } from '@/utils/api-client';
import { useAuth } from '@/context/AuthContext';

export default function DataComponent() {
  const api = useApiClient();
  const auth = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadData = async () => {
    setLoading(true);
    const response = await api.get('/admin/users');
    
    if (response.error) {
      // Error handling built-in, includes retry logic
      console.error('Failed to load data:', response.error);
    } else {
      setData(response.data);
    }
    setLoading(false);
  };
  
  // Auto-retry, session refresh, and error handling included
  useEffect(() => { loadData(); }, []);
  
  return <DataDisplay data={data} loading={loading} />;
}
```

### ✅ Feature Gate Pattern
```tsx
import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';

export default function AdminSection() {
  return (
    <FeatureGate feature="admin_dashboard">
      <AdminContent />
    </FeatureGate>
  );
}
```

## CRITICAL: Next.js Build Error Prevention
**Based on July 22-23, 2025 debugging session**

### ✅ WORKING PATTERNS
```tsx
'use client';
import { useEffect, useState } from 'react';

// Prevent static generation for admin pages
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Page Title</h1>
        {/* Use simple HTML + Tailwind */}
      </div>
    </div>
  );
}
```

### ❌ AVOID THESE PATTERNS
- `import React from 'react'` (causes module resolution issues)
- Custom UI components during static generation
- Mixed `className` and inline `style` objects
- Complex useEffect hooks with browser-only code
- Dynamic supabase imports in component initialization
- Manual session management (use AuthContext instead)
- Direct fetch calls (use useApiClient instead)

## RBAC Protection Pattern (UPDATED)
Every protected page should use the new centralized auth patterns:
```tsx
import { useAuth } from '@/context/AuthContext';
import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';

export default function ProtectedPage() {
  return (
    <FeatureGate feature="feature_key">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-4">Protected Content</h1>
          {/* Your content here */}
        </div>
      </div>
    </FeatureGate>
  );
}
      </div>
    </div>
  );
  
  if (!allowed) return <Forbidden />;
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page content */}
    </div>
  );
}
```

## Modal Component Pattern
For edit/delete modals:
```tsx
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}

export default function EditModal({ isOpen, onClose, onSave, initialData }: EditModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Modal content */}
      </div>
    </div>
  );
}
```

## API Call Pattern
Standard pattern for API calls in components:
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

const handleApiCall = async () => {
  setLoading(true);
  setError('');
  
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Something went wrong');
    }
    
    const result = await response.json();
    // Handle success
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Tailwind CSS Patterns
Consistent styling patterns:
```tsx
// Page container
<div className="max-w-4xl mx-auto p-6">

// Card layout
<div className="bg-white shadow-lg rounded-lg p-6">

// Grid layouts
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Button styles
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">

// Form inputs
<input className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
```

## File Organization
```
/app/
  /components/           # Shared components
    /ui/                # UI components (Navbar, Sidebar, etc.)
  /[page]/
    page.tsx           # Main page component
    loading.tsx        # Loading state
  /api/
    /[endpoint]/
      route.ts         # API handler

/utils/
  /hooks/              # Custom hooks
  /supabase/           # Supabase clients
  types.ts             # TypeScript types
  rbac.ts              # RBAC utilities
```

## Import Conventions
```tsx
// React hooks - specific imports
import { useState, useEffect } from 'react';

// Custom hooks - relative paths
import { useRequireFeature } from '../../utils/hooks/useRequireFeature';

// Types - centralized
import { UserProfile, AccessGroup } from '@/utils/types';

// Supabase - use appropriate client
import { createClient } from '@/utils/supabase/browser'; // Client components
import { createClient } from '@/utils/supabase/server'; // Server components/API
```

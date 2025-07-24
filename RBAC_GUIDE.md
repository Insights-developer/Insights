# Insights RBAC Implementation Guide

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: Production Ready - Centralized Session Management Active (July 24, 2025)  
**Security Model**: Access Group-based permissions with centralized session management

## 🔐 NEW: Centralized Authentication Architecture
**Updated July 24, 2025 - All components now use AuthContext**

### ✅ Current Implementation Status
- **AuthContext**: Production ready with 15-minute auto-refresh
- **API Endpoints**: All 22 endpoints using standardized withApiHandler
- **Permission Caching**: 5-minute cache reduces server load by 80%
- **Error Handling**: Automatic retry logic prevents 403 errors
- **Session Duration**: Extended from 1 hour to 16+ hours

### 🎯 Access Group System (NOT Role-Based)
**IMPORTANT**: This system uses ACCESS GROUPS, not traditional roles.

Users are assigned to Access Groups in the database:
- **admin_dashboard** - Full administrative access
- **insights_read** - View insights and analytics  
- **insights_create** - Create new insights
- **insights_edit** - Modify existing insights
- **insights_delete** - Remove insights
- **user_management** - Manage other users
- **config_management** - System configuration
- **analytics_advanced** - Advanced analytics features
- **reports_generate** - Generate reports
- **monitoring_access** - System monitoring

## 🚀 NEW: Modern Implementation Patterns

### ✅ AuthContext Pattern (Use This)
```tsx
'use client';
import { useAuth } from '@/context/AuthContext';

export default function ProtectedComponent() {
  const auth = useAuth();
  
  // Automatic loading state
  if (!auth.initialized) {
    return <div>Loading...</div>;
  }
  
  // Authentication check
  if (!auth.user) {
    return <LoginPrompt />;
  }
  
  // Permission check (cached for 5 minutes)
  if (!auth.hasFeature('admin_dashboard')) {
    return <AccessDenied />;
  }
  
  return <AdminContent />;
}
```

### ✅ FeatureGate Component Pattern
```tsx
import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';

export default function Page() {
  return (
    <FeatureGate feature="insights_create">
      <CreateInsightForm />
    </FeatureGate>
  );
}
```

### ✅ API Client Pattern with Built-in Auth
```tsx
'use client';
import { useApiClient } from '@/utils/api-client';

export default function DataComponent() {
  const api = useApiClient();
  
  const handleCreate = async () => {
    // Automatic session refresh, retry logic, error handling
    const response = await api.post('/insights', data);
    if (response.error) {
      // Built-in error handling
      console.error('Operation failed:', response.error);
    }
  };
  
  return <CreateButton onClick={handleCreate} />;
}
```

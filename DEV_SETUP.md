# Insights Development Setup Guide

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: Production Ready - Centralized Session Management Active (July 24, 2025)  
**Framework**: Next.js 15.4.2 with React 19, TypeScript, and Supabase

## 🚀 Quick Start (Updated Architecture)

### Prerequisites
- Node.js 18+ installed
- Supabase account and project created
- Git repository access

### 1. Environment Setup
```bash
# Clone repository
git clone [repository-url]
cd insights

# Install dependencies  
cd frontend
npm install

# Environment variables (.env.local)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. ✅ NEW: Centralized Session Management
**All authentication now flows through AuthContext - No manual session handling required**

The application includes:
- **AuthContext**: Automatic 15-minute session refresh
- **API Client**: Built-in retry logic and error handling  
- **Standardized APIs**: All 22 endpoints use withApiHandler pattern
- **Permission Caching**: 5-minute cache reduces server load

### 3. Development Server
```bash
# Start development server
npm run dev

# Application runs on http://localhost:3000
# All authentication handled automatically by AuthContext
```

## 🔐 Authentication Development Notes

### Modern Patterns (Use These)
```tsx
// ✅ Use AuthContext for all auth state
import { useAuth } from '@/context/AuthContext';

export default function MyComponent() {
  const auth = useAuth();
  
  if (!auth.initialized) return <div>Loading...</div>;
  if (!auth.user) return <LoginPrompt />;
  if (!auth.hasFeature('required_feature')) return <AccessDenied />;
  
  return <AuthenticatedContent />;
}
```

```tsx  
// ✅ Use API Client for all requests
import { useApiClient } from '@/utils/api-client';

export default function DataComponent() {
  const api = useApiClient();
  
  const loadData = async () => {
    const response = await api.get('/admin/users');
    // Automatic retry, session refresh, error handling included
  };
}
```

### ❌ Deprecated Patterns (Don't Use)
- Manual `supabase.auth.getSession()` calls
- Direct `fetch()` without authentication
- Component-level session refresh logic
- Manual permission checking without AuthContext

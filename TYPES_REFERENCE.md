# Insights TypeScript Types Reference

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: Production Ready - Session Management Types Complete (July 24, 2025)  
**Language**: TypeScript with strict type checking

## 🔐 NEW: Session Management Types
**Updated July 24, 2025 - Centralized authentication type definitions**

### AuthContext Types
```typescript
// Core authentication state
interface AuthState {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  features: string[];
  featuresLastFetched: number;
  sessionRefreshInProgress: boolean;
}

// Authentication context interface
interface AuthContextType {
  user: User | null;
  session: Session | null;
  initialized: boolean;
  features: string[];
  hasFeature: (feature: string) => boolean;
  refreshSession: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  signOut: () => Promise<void>;
}

// User type with extended properties
interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  login_count?: number;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
}
```

### API Client Types
```typescript
// API response wrapper
interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status?: number;
}

// API client interface
interface ApiClient {
  get: <T>(url: string) => Promise<ApiResponse<T>>;
  post: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
  patch: <T>(url: string, data?: any) => Promise<ApiResponse<T>>;
  delete: <T>(url: string) => Promise<ApiResponse<T>>;
}

// API handler request context
interface ApiRequestContext {
  user: User;
  features: string[];
  session: Session;
}
```

### Database Entity Types
```typescript
// Access group definition
interface AccessGroup {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

// User access group assignment
interface UserAccessGroup {
  user_id: string;
  group_id: number;
  assigned_at: string;
  assigned_by?: string;
}

// Feature permission check
interface FeatureCheck {
  feature: string;
  allowed: boolean;
  reason?: string;
}
```

### Component Prop Types
```typescript
// Feature gate component props
interface FeatureGateProps {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Protected route props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeatures?: string[];
  requireAll?: boolean;
}

// API error handler props
interface ApiErrorHandlerProps {
  error: string | null;
  onRetry?: () => void;
  showRetry?: boolean;
}
```

### Utility Types
```typescript
// Async operation state
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Permission cache entry
interface PermissionCacheEntry {
  features: string[];
  timestamp: number;
  userId: string;
}

// Session refresh configuration
interface SessionConfig {
  refreshInterval: number; // 15 minutes
  permissionCacheTime: number; // 5 minutes
  retryAttempts: number; // 3 attempts
  retryDelay: number; // 1 second
}
```

## Legacy Types (Deprecated)
```typescript
// ❌ Old manual session management (don't use)
interface OldAuthHook {
  user: User | null;
  loading: boolean;
  signOut: () => void;
}

// ❌ Old permission checking (don't use)  
interface OldFeatureHook {
  allowed: boolean;
  loading: boolean;
}
```

## Type Usage Patterns

### ✅ Modern AuthContext Pattern
```typescript
const MyComponent: React.FC = () => {
  const auth: AuthContextType = useAuth();
  
  // Type-safe feature checking
  const canEdit: boolean = auth.hasFeature('insights_edit');
  
  return canEdit ? <EditForm /> : <ReadOnlyView />;
};
```

### ✅ API Client with Types
```typescript
interface CreateInsightRequest {
  title: string;
  description: string;
  data: Record<string, any>;
}

interface InsightResponse {
  id: string;
  title: string;
  created_at: string;
}

const useCreateInsight = () => {
  const api = useApiClient();
  
  return async (data: CreateInsightRequest): Promise<ApiResponse<InsightResponse>> => {
    return api.post<InsightResponse>('/insights', data);
  };
};
```

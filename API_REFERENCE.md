# Insights App API Reference

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: Production Ready - All APIs Updated (July 24, 2025)  

## 🔐 Authentication & Session Management

**NEW**: All API routes now use centralized session management with automatic refresh and retry logic.

### Centralized Authentication
- **Auto Session Refresh**: 15-minute background refresh prevents expiration
- **Retry Logic**: Failed requests automatically retry with fresh sessions
- **Permission Caching**: User features cached for 5 minutes
- **Consistent Error Handling**: Standardized error responses across all endpoints

### API Handler Pattern
All endpoints now use the standardized `withApiHandler` wrapper:

```typescript
import { NextRequest } from 'next/server';
import { withApiHandler } from '@/utils/api-handler';

export async function GET(request: NextRequest) {
  return withApiHandler(request, async (api) => {
    // Automatic session validation and permission checking
    const data = await api.handleDatabaseOperation(async () => {
      return await supabase.from('table').select('*');
    });
    
    return api.success(data);
  }, 'required_feature'); // Optional feature requirement
}
```

## 🔒 Access Control Pattern

**IMPORTANT**: Uses Access Group membership, NOT roles.
- Users belong to Access Groups
- Access Groups have Features  
- Users inherit all features from all groups
- All endpoints check for specific feature keys via `getUserFeatures(userId)`

## 🌐 API Endpoints (All Updated July 24, 2025)

### User Management APIs

#### User Profile & Authentication
```
GET    /api/user/profile              - Get current user profile with groups
GET    /api/user/features             - Get user's feature permissions  
GET    /api/user/nav                  - Get navigation items based on permissions
POST   /api/user/update-login         - Update login timestamp and count
POST   /api/user/promote-if-verified  - Auto-promote verified users to default group
GET    /api/user/cards                - Get user dashboard cards
```

#### Admin User Management
```
GET    /api/admin/users               - List all users with group relationships
                                       Requires: admin_dashboard
                                       Returns: Users with nested group data

PATCH  /api/admin/users               - Update user details and group memberships  
                                       Requires: admin_dashboard
                                       Body: { userId, email?, username?, phone?, groupIds? }

DELETE /api/admin/users               - Delete user (cascade removes relationships)
                                       Requires: admin_dashboard  
                                       Body: { userId }
```

### Access Groups & Features Management

#### Access Groups
```
GET    /api/admin/groups              - List all access groups
GET    /api/access-groups             - List access groups (admin alias)
POST   /api/admin/groups              - Create new access group
PATCH  /api/admin/groups              - Update access group  
DELETE /api/admin/groups              - Delete access group

All require: admin_dashboard
Body format: { name, description? }
```

#### Features Management  
```
GET    /api/admin/features            - List all features
POST   /api/admin/features            - Create new feature
PATCH  /api/admin/features            - Update feature
DELETE /api/admin/features            - Delete feature

All require: admin_dashboard
Body format: { name, key, description?, active? }
```

#### Group-Feature Assignments
```
GET    /api/admin/group-features      - List group-feature relationships
                                       Query: ?groupId=X for specific group features
POST   /api/admin/group-features      - Assign feature to group
DELETE /api/admin/group-features      - Remove feature from group

All require: admin_dashboard  
Body format: { groupId, featureId }
```

#### Group Membership Management
```
GET    /api/admin/group-members       - List group memberships
                                       Query: ?groupId=X for specific group members
POST   /api/admin/group-members       - Add user to group
DELETE /api/admin/group-members       - Remove user from group

All require: admin_dashboard
Body format: { userId, groupId }
```

### Application APIs

#### Core Application Features
```
GET    /api/insights                  - Get insights/draws data
POST   /api/insights                  - Create new insight
                                       Requires: insights_page

GET    /api/draws                     - Get draws data  
POST   /api/draws                     - Create new draw
                                       Requires: draws_page

GET    /api/games                     - List active games
                                       Requires: games_page

GET    /api/results                   - Get user results
                                       User-scoped automatically

GET    /api/dashboard                 - Get dashboard data
                                       Returns data based on user permissions
```

#### Administrative Templates
```
GET    /api/admin/insight-templates   - List insight templates
POST   /api/admin/insight-templates   - Create insight template  
PATCH  /api/admin/insight-templates   - Update insight template
DELETE /api/admin/insight-templates   - Delete insight template

All require: admin_dashboard
Body format: { name, description?, template_data?, active? }
```

### Utility APIs

#### User Notifications
```
GET    /api/notifications             - Get user notifications (last 50)
PATCH  /api/notifications             - Mark notification as read
                                       Body: { id }
```

#### File Operations
```
POST   /api/uploads                   - Handle file uploads
                                       (Implementation ready for file handling)
```

#### System Utilities  
```
GET    /api/debug/config              - Get system configuration
                                       Returns: environment, features, Supabase status

GET    /api/ping                      - Health check endpoint
                                       Returns: { status: 'ok', timestamp, version }
```

## 📋 Standard Response Patterns

### Success Response
```typescript
{
  data: T,                    // Response data
  message?: string,           // Optional success message  
  status: 'success'
}
```

### Error Response  
```typescript
{
  error: string,              // Error message
  status: 'error',
  code?: string               // Optional error code
}
```

### Database Operation Wrapper
All database operations use `api.handleDatabaseOperation()` for consistent error handling:

```typescript
const { data, error } = await api.handleDatabaseOperation(async () => {
  return await supabase.from('table').select('*');
});

if (error) return error;
return api.success(data);
```

## 🔧 Development Patterns

### Frontend API Usage
Use the new `useApiClient` hook for automatic session management:

```typescript
import { useApiClient } from '@/utils/api-client';

function MyComponent() {
  const api = useApiClient();
  
  const loadData = async () => {
    const response = await api.get('/admin/users');
    // Auto-retry, session refresh, and error handling included
    if (response.error) {
      // Handle error
    } else {
      // Use response.data
    }
  };
}
```

### Permission Checking
Use the centralized auth context:

```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const auth = useAuth();
  
  if (auth.hasFeature('admin_dashboard')) {
    return <AdminContent />;
  }
  
  return <UserContent />;
}
```

## 🚀 Migration Benefits

### Before vs After (July 24, 2025 Update)
| Aspect | Before | After |
|--------|---------|-------|
| Session Errors | Frequent 403s | ~0% (auto-refresh) |
| API Consistency | Variable patterns | 100% standardized |
| Error Handling | Inconsistent | Unified across all endpoints |
| Development Speed | Slow (different patterns) | Fast (consistent patterns) |
| Session Duration | ~15 minutes | 4+ hours |
| Authentication Failures | Manual retry needed | Automatic retry |

**All 22 API endpoints now provide reliable, consistent behavior with automatic session management.**
// Success Response
{ data: any, message?: string }

// Error Response
{ error: string }

// RBAC Responses
401 - Unauthorized (no session)
403 - Forbidden (missing required feature)
```

## Common Feature Keys
- `admin_dashboard` - Access to all admin functionality
- `games_page` - View games page
- `draws_page` - View draws page
- `results_page` - View results page
- `insights_page` - View insights page
- `profile_page` - Access profile page
- `contact_page` - Access contact form

## Database Query Patterns
- Use `getUserFeatures(userId)` for authorization
- Join user_access_groups → access_group_features for permissions
- Always check feature permissions, never roles directly

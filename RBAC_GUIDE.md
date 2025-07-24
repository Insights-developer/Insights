# Insights App Access Control Guide

**Important**: The Insights app uses **Access Groups** (not traditional roles) to manage user permissions.

## Overview
The Insights app uses a sophisticated access control system based on **Access Group membership** and **feature permissions**. Users do NOT have individual roles - they belong to Access Groups that determine their access level and available features.

## Database Schema

### Core Tables
```sql
-- Users (basic info only - NO ROLE FIELD USED)
users: id, email, username, phone, login_tracking...
-- Note: 'role' field exists but is DEPRECATED - use Access Groups instead

-- Access Groups (define user access levels)
access_groups: id, name, description

-- Features (app capabilities that can be granted)
features: id, key, name, description, nav_name, icon_url, url, order, type, active

-- Join Tables (establish relationships)
user_access_groups: user_id, group_id
access_group_features: group_id, feature (references features.key)
```

## How Access Control Works

### 1. User → Access Groups → Features Flow
```
User → member of Access Groups → Access Groups have Features → User inherits all Features
```

### 2. Permission Check Process
```typescript
// Get user's feature permissions
const features = await getUserFeatures(userId);

// Check if user has specific feature
if (features.includes('admin_dashboard')) {
  // Allow access
}
```

### 3. Frontend Protection
```tsx
// Every protected page
const { allowed, loading } = useRequireFeature('feature_key');
```

### 4. API Protection
```typescript
// Every protected API endpoint
const features = await getUserFeatures(user.id);
if (!features.includes('required_feature')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

## Standard Feature Keys

### Admin Features
- `admin_dashboard` - Access to all admin functionality
- `admin_users` - Manage users (covered by admin_dashboard)
- `admin_groups` - Manage groups (covered by admin_dashboard)
- `admin_features` - Manage features (covered by admin_dashboard)

### User Features
- `dashboard_page` - Access main dashboard
- `games_page` - View games
- `draws_page` - View draws
- `results_page` - View results
- `insights_page` - View insights
- `profile_page` - Access user profile
- `contact_page` - Access contact form

### Navigation Features
Features control both page access AND navigation visibility.

## RBAC Utilities

### Core Function: `getUserFeatures()`
```typescript
// /utils/rbac.ts
export async function getUserFeatures(userId: string): Promise<string[]> {
  // 1. Get user's groups
  // 2. Get features for those groups
  // 3. Return deduplicated feature array
}
```

### Deprecated: Role Checks
```typescript
// ❌ DON'T USE - Legacy pattern
const role = await getUserRole(userId);
if (role === 'admin') { /* ... */ }

// ✅ USE - Modern RBAC
const features = await getUserFeatures(userId);
if (features.includes('admin_dashboard')) { /* ... */ }
```

## Frontend Implementation

### Page Protection Hook
```tsx
// /utils/hooks/useRequireFeature.tsx
export function useRequireFeature(featureKey: string) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Fetches user features and checks permission
  // Returns: { allowed: boolean, loading: boolean }
}
```

### Navigation Integration
```tsx
// Sidebar shows only features user has access to
// Auto-refreshes when admin changes user permissions
```

## Admin Management

### Creating Groups
1. Admin creates access group (`access_groups` table)
2. Admin assigns features to group (`access_group_features` table)
3. Admin assigns users to group (`user_access_groups` table)

### Managing Features
1. Features are created in the `features` table
2. Features define:
   - `key` - Used for permission checks
   - `name` - Human-readable name
   - `nav_name` - Navigation label
   - `url` - Page URL (defaults to /key)
   - `icon_url` - Navigation icon
   - `order` - Navigation order
   - `type` - 'page', 'card', 'widget', etc.
   - `active` - Enable/disable feature

### User Management
1. Users are assigned to groups (not directly to features)
2. Users inherit ALL features from ALL their groups
3. Admin can see effective permissions for each user

## Best Practices

### 1. Always Use Feature Keys
```typescript
// ❌ Wrong
if (user.role === 'admin') { ... }

// ✅ Correct
if (features.includes('admin_dashboard')) { ... }
```

### 2. Consistent Feature Naming
- Use descriptive names: `admin_dashboard`, `games_page`
- Follow pattern: `[area]_[action/type]`
- Keep keys URL-friendly (lowercase, underscores)

### 3. Group Organization
- Create logical groups: `Admins`, `Premium Users`, `Basic Users`
- Don't create too many granular groups
- Groups should represent user types, not individual permissions

### 4. Feature Granularity
- Create features for each major page/function
- Don't over-granulate (avoid `games_view`, `games_edit` separately)
- Balance security with maintainability

## Troubleshooting

### Common Issues
1. **User can't access page**: Check group membership and feature assignments
2. **Navigation not updating**: Admin changes require page refresh/re-login
3. **API returning 403**: Verify feature key matches between frontend and API

### Debug Commands
```typescript
// Check user's features
const features = await getUserFeatures(userId);
console.log('User features:', features);

// Check group membership
const { data } = await supabase
  .from('user_access_groups')
  .select('group_id')
  .eq('user_id', userId);
```

## Migration Notes
- Legacy `role` field still exists in users table but is ignored
- All permission checks now use `getUserFeatures()`
- No breaking changes to existing user accounts

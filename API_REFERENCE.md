# Insights App API Reference

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  

## Authentication
All API routes use Supabase authentication. Protected routes require valid session.

## Access Control Pattern
All protected endpoints use `getUserFeatures(userId)` to check permissions via Access Group membership.
**Important**: Never use legacy role checks - always check for specific feature keys.
Users do NOT have individual roles - they belong to Access Groups that determine access levels.

## Core API Endpoints

### User Management
```
GET    /api/user/profile              - Get current user profile with groups
POST   /api/user/update-login         - Update login timestamp
GET    /api/user/features             - Get user's feature permissions
GET    /api/user/nav                  - Get navigation items for user

GET    /api/admin/users               - List all users (requires: admin_dashboard)
PATCH  /api/admin/users/[id]          - Update user (requires: admin_dashboard)
DELETE /api/admin/users/[id]          - Delete user (requires: admin_dashboard)
```

### Access Groups & Features
```
GET    /api/admin/groups              - List access groups (requires: admin_dashboard)
POST   /api/admin/groups              - Create group (requires: admin_dashboard)
PATCH  /api/admin/groups/[id]         - Update group (requires: admin_dashboard)
DELETE /api/admin/groups/[id]         - Delete group (requires: admin_dashboard)

GET    /api/admin/features            - List features (requires: admin_dashboard)
POST   /api/admin/features            - Create feature (requires: admin_dashboard)
```

### Business Logic
```
GET    /api/games                     - List games (requires: games_page)
GET    /api/draws                     - List draws (requires: draws_page)
GET    /api/results                   - Get results (requires: results_page)
GET    /api/insights                  - Get insights (requires: insights_page)
POST   /api/contact                   - Submit contact form
```

## Standard Response Patterns
```typescript
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

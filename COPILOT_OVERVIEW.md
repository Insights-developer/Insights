# Insights App - Copilot Overview

> **Purpose**: This document provides AI assistants like GitHub Copilot with a high-level understanding of the Insights application architecture, key design decisions, and important patterns.

## 🏢 Project Context

**Insights** is a comprehensive lottery analytics application developed by Lottery Analytics that provides game management, draw tracking, result analysis, and user management with enterprise-grade access control system.

## 🏗️ Architecture at a Glance

### Core Technologies
- **Frontend**: Next.js 15.4.2 (App Router) + React 19 + TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS v4
- **Deployment**: Vercel

### Key Architectural Decisions

1. **Permission System**: Uses Access Groups instead of traditional roles
   - Users belong to groups, groups have features, users inherit all features from all groups
   - This provides more flexibility than role-based access control

2. **Component Structure**: Clean separation between UI, data, and business logic
   - API routes handle permission checks and data operations
   - React components focus on presentation
   - Hooks manage UI state and API interactions
   
3. **Navigation System**: Dynamic sidebar driven by user permissions
   - Sidebar only shows items the user has permission to access
   - Based on features of type 'page' that the user has access to

4. **Authentication**: Supabase Auth with tracking
   - Email/password authentication with email verification
   - Login history tracking for security and analytics
   - Guest → Member promotion after email verification

## 🔑 Core Concepts

### 1. Access Group System (NOT Role-Based)

The most important concept to understand is that user permissions are determined by **Access Group membership**, not roles:

```
User → member of Access Groups → Access Groups have Features → User inherits all Features
```

Key database tables:
- `users`: Basic user information
- `access_groups`: Groups that define permission levels
- `features`: App capabilities that can be granted
- `user_access_groups`: Join table linking users to groups
- `access_group_features`: Join table linking groups to features

**Critical**: The `role` field in users table exists but is DEPRECATED - use Access Groups instead

### 2. Features & Permissions

Features are the atomic units of permission in the app:

- Each feature has a `key` used for permission checks (e.g., `admin_dashboard`)
- Features have different types: 'page', 'card', 'widget'
- Features control both page access AND navigation visibility

Core permission check pattern:
```typescript
// Backend/API permission check
const features = await getUserFeatures(userId);
if (!features.includes('required_feature')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Frontend permission check
const { allowed, loading } = useRequireFeature('feature_key');
if (!allowed) return <Forbidden />;
```

### 3. Business Entities

Core business entities in the system:
- **Games**: Lottery game definitions and configurations
- **Draws**: Historical draw results and data
- **Insights**: Analytics templates and pattern recognition
- **Users**: Account management with group-based permissions

### 4. Next.js Build Patterns

Due to previous build issues, the app follows strict patterns for admin pages:
- Uses `'use client'` directive
- Specific import patterns: `import { useState } from 'react'` (never `import React from 'react'`)
- Simple HTML + Tailwind CSS (avoids complex components in static generation)
- Dynamic routes set `export const dynamic = 'force-dynamic'`

## 🚨 Known Issues & Workarounds

1. **Admin Users Page Location**: `/manage-users` (not `/admin/users`)
   - Due to Next.js framework bug with `/admin/users` path
   - This is a permanent workaround and is fully functional

2. **Navigation Refresh**: Sidebar doesn't immediately update after permission changes
   - Requires page refresh to see changes
   - Real-time updates via Supabase subscriptions planned

3. **Import Paths**: Using relative paths (no path aliases configured)
   - Results in verbose imports like `../../utils/hooks/useRequireFeature`

## 💡 Development Patterns

### Page Protection Pattern
Every protected page uses the `useRequireFeature` hook:
```tsx
const { allowed, loading } = useRequireFeature('feature_key');
if (loading) return <LoadingSpinner />;
if (forbidden) return <Forbidden />;
// Render actual content
```

### Supabase Client Usage
- **Client components**: `import { createClient } from '@/utils/supabase/browser'`
- **Server components/API**: `import { createClient } from '@/utils/supabase/server'`

### API Structure
- API routes follow REST conventions
- Every protected API does permission checks using `getUserFeatures()`
- API endpoints provide data for dynamic navigation, cards, and page content

## 🗂️ Project Organization

Important directories:
- `/frontend/app/components`: Reusable React components
- `/frontend/app/api`: API routes for data operations
- `/frontend/utils`: Utility functions including RBAC helpers
- `/frontend/utils/hooks`: React hooks for common patterns

Documentation:
- `.md` files in project root contain all project documentation
- `insights_maintenance.py` generates documentation and schema files

## 📊 Code Insights

### API Endpoints

| Endpoint | Methods | Required Features |
|---------|---------|------------------|
| `/api/admin/groups` | GET, POST | admin_dashboard |
| `/api/admin/group-features` | GET, POST, DELETE | admin_dashboard, admin_dashboard |
| `/api/admin/features` | GET, POST, PATCH | admin_dashboard |
| `/api/admin/users` | GET, DELETE, PATCH | admin_dashboard, admin_dashboard, admin_dashboard |
| `/api/admin/users/[id]` | DELETE, PATCH |  |
| `/api/admin/insight-templates` | GET, POST, DELETE, PATCH | admin_dashboard |
| `/api/admin/group-members` | GET, POST, DELETE | admin_dashboard, admin_dashboard, admin_dashboard |
| `/api/results` | GET | results_page |
| `/api/games` | GET, POST | games_page, admin_dashboard |
| `/api/profile` | GET, PATCH |  |
| ... | ... | ... | _(plus 14 more)_ |

### Detected Feature Keys

Features used in code: `admin_dashboard`, `contact`, `dashboard_page`, `games_page`, `insights_page`, `profile_page`, `results_page`

### Database Tables Used in Code

Tables referenced: `access_group_features`, `access_groups`, `features`, `insight_templates`, `login_history`, `uploads`, `user_access_groups`, `users`

## 📝 Common Development Tasks

1. **Adding a new feature**:
   - Add entry to `features` table
   - Assign to appropriate access groups
   - Create page component with `useRequireFeature` hook
   - Add API routes with permission checks

2. **Adding a new user**:
   - User registers through Supabase Auth
   - Admin assigns user to appropriate groups
   - User automatically gets permissions from groups

3. **Debugging permission issues**:
   - Check user's group memberships
   - Check groups' feature assignments
   - Check for typos in feature keys

---

*This overview is automatically generated to help AI assistants understand the project quickly.*

## Code Insights

This section contains automatically generated insights about the codebase structure.
It helps AI assistants understand the application architecture without extensive exploration.

### API Structure
*The application has 24 API endpoints:*

- **/api/admin/groups** (GET, POST)
- **/api/admin/group-features** (GET, POST, DELETE)
- **/api/admin/features** (GET, POST, PATCH)
- **/api/admin/users** (GET, DELETE, PATCH)
- **/api/admin/users/[id]** (DELETE, PATCH)
- **/api/admin/insight-templates** (GET, POST, DELETE, PATCH)
- **/api/admin/group-members** (GET, POST, DELETE)
- **/api/results** (GET)
- **/api/games** (GET, POST)
- **/api/profile** (GET, PATCH)
- *...and 14 more endpoints*

### Component Structure
*The application has 22 React components*

- **Forbidden** - `frontend/app/components/Forbidden.tsx`
- **AuthForm** - `frontend/app/components/AuthForm.tsx`
- **EditUserModal** - `frontend/app/components/EditUserModal.tsx`
- **ConfirmModal** - `frontend/app/components/ConfirmModal.tsx`
- **AdminUserTable** - `frontend/app/components/AdminUserTable.tsx`
- *...and 17 more components*

### Features
*The application has 7 feature flags:*

- `admin_dashboard`
- `contact`
- `dashboard_page`
- `games_page`
- `insights_page`
- `profile_page`
- `results_page`

### TypeScript Type Definitions
*The application has 109 type definitions:*

**Interfaces (84)**
- `CacheItem` - 3 properties - `frontend/utils/cache.ts`
- `PageProps` - 2 properties - `frontend/.next/types/app/page.ts`
- `LayoutProps` - 2 properties - `frontend/.next/types/app/page.ts`
- `PageProps` - 2 properties - `frontend/.next/types/app/admin/page.ts`
- `LayoutProps` - 2 properties - `frontend/.next/types/app/admin/page.ts`
- *...and 79 more interfaces*

**Type Aliases (25)**
- `UserProfile` - `frontend/utils/types.ts`
- `AccessGroup` - `frontend/utils/types.ts`
- `UserAccessGroup` - `frontend/utils/types.ts`
- `Feature` - `frontend/utils/types.ts`
- `AccessGroupFeature` - `frontend/utils/types.ts`
- *...and 20 more type aliases*

### Component Dependencies
*The application has 41 components with dependencies:*

- `DashboardPage` depends on: `Card`, `PageLayout`, `Icon`
  - *...and 2 more components*
- `ResultsPage` depends on: `Card`, `Icon`, `Spinner`
  - *...and 1 more components*
- `GamesPage` depends on: `Card`, `Icon`, `Spinner`
  - *...and 1 more components*
- `ProfilePage` depends on: `PageLayout`, `Icon`, `Spinner`
  - *...and 1 more components*
- `ContactPage` depends on: `PageLayout`, `Icon`, `Spinner`
  - *...and 1 more components*

### API Usage
*The application has 12 API endpoints used in code:*

- `/api/user/features` - Used in 12 locations
- `/api/user/update-login` - Used in 6 locations
- `/api/user/nav` - Used in 5 locations
- `/api/admin/users` - Used in 5 locations
- `/api/admin/groups` - Used in 5 locations

### Feature Flag Usage
*Feature flags are used in 26 locations:*

- `admin_dashboard` - Used in 15 locations
- `games_page` - Used in 3 locations
- `results_page` - Used in 2 locations
- `contact` - Used in 2 locations
- `insights_page` - Used in 2 locations

*Generated on: 2025-07-24 01:21:43*
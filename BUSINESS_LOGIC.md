# Insights App Business Logic Overview

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  

## Application Purpose
**Insights** is a lottery analytics application developed by **Lottery Analytics** that provides:
- Game management and draw tracking
- Result analysis and insights
- User management with Access Group-based permissions
- Administrative tools for data management

## Core Business Entities

### 1. Games
**Purpose**: Define lottery games that can be tracked and analyzed
```typescript
interface Game {
  id: number;
  name: string;           // e.g., "Powerball", "Mega Millions"
  config: object;         // Game-specific configuration (number ranges, etc.)
  created_at: timestamp;
  updated_at: timestamp;
}
```

**Business Rules**:
- Games define the structure for draws
- Configuration determines valid number ranges
- Games can be active/inactive

### 2. Draws
**Purpose**: Record actual lottery draw results
```typescript
interface Draw {
  id: number;
  game_id: number;        // Links to specific game
  draw_date: date;        // When the draw occurred
  results: number[];      // Main numbers drawn
  bonus: number[];        // Bonus/powerball numbers (optional)
  uploaded_by: uuid;      // User who entered the data
  created_at: timestamp;
}
```

**Business Rules**:
- One draw per game per date
- Results must conform to game configuration
- Historical draws enable pattern analysis

### 3. Insights & Analysis
**Purpose**: Generate analytics and patterns from historical draw data
```typescript
interface InsightTemplate {
  id: number;
  template_name: string;  // Type of analysis
  description: string;    // What this insight reveals
  config: object;         // Parameters for analysis
  created_at: timestamp;
}
```

**Business Rules**:
- Insights are generated from draw patterns
- Templates define reusable analysis types
- Results help users make informed decisions

### 4. User Management
**Purpose**: Control access to different app features and data
```typescript
interface User {
  id: uuid;               // Matches Supabase auth
  email: string;
  username?: string;
  phone?: string;
  current_login_at?: timestamp;
  previous_login_at?: timestamp;
  login_count: number;
  role: string;           // Legacy - not used for permissions
}
```

**Business Rules**:
- Users authenticate via Supabase
- Access controlled through group membership, not roles
- Login history tracked for security/analytics

## RBAC (Role-Based Access Control)

### Access Groups
**Purpose**: Logical groupings of users with similar access needs
```typescript
interface AccessGroup {
  id: number;
  name: string;           // e.g., "Admins", "Premium Users", "Basic Users"
  description?: string;   // Purpose of this group
}
```

### Features
**Purpose**: Define app capabilities that can be granted/restricted
```typescript
interface Feature {
  id: number;
  key: string;           // Unique identifier (e.g., "admin_dashboard")
  name: string;          // Human-readable name
  nav_name?: string;     // Label for navigation
  description?: string;  // What this feature provides
  url?: string;          // Page URL (defaults to /key)
  icon_url?: string;     // Navigation icon
  order: number;         // Display order
  type: string;          // 'page', 'card', 'widget', etc.
  active: boolean;       // Enable/disable feature
}
```

**Business Rules**:
- Users inherit features through group membership
- Features control both page access and navigation visibility
- Admin can dynamically assign features to groups

## User Journey & Workflows

### 1. New User Onboarding
```
1. User signs up via Supabase Auth
2. User record created in users table
3. Admin assigns user to appropriate access group(s)
4. User gains access to features based on group membership
5. Navigation automatically reflects user's permissions
```

### 2. Daily Usage
```
1. User logs in (login timestamp tracked)
2. Dashboard shows permitted features as cards/links
3. User navigates to authorized pages (RBAC enforced)
4. User interacts with lottery data within their permission level
5. User can access profile, contact form, etc. based on features
```

### 3. Admin Management
```
1. Admin accesses admin dashboard (requires admin_dashboard feature)
2. Admin can:
   - Manage users (view, edit, delete, group assignments)
   - Manage access groups (create, modify, delete)
   - Manage features (create, modify, activate/deactivate)
   - View system analytics and user activity
3. Changes to permissions immediately affect user access
```

## Data Flow Patterns

### 1. User Permission Resolution
```
User Login → getUserFeatures(userId) → 
  Query user_access_groups → 
  Query access_group_features → 
  Return deduplicated feature array →
  Frontend receives permissions →
  Navigation and pages render based on features
```

### 2. Admin Operations
```
Admin Action → 
  Check admin_dashboard feature → 
  Validate operation permissions → 
  Update database → 
  Refresh affected user sessions → 
  Update navigation/UI
```

### 3. Data Entry & Analysis
```
Upload Draw Data → 
  Validate against game config → 
  Store in draws table → 
  Trigger insight calculations → 
  Update analysis results → 
  Notify relevant users
```

## Business Rules & Constraints

### Data Integrity
- Users must belong to at least one access group
- Features must have unique keys
- Draw dates must be unique per game
- Email addresses must be unique across users

### Security
- All API endpoints protected by feature-based RBAC
- No direct role-based access (legacy role field ignored)
- Admin operations require specific feature permissions
- User data changes logged with timestamps

### User Experience
- Navigation dynamically generated from user features
- Loading states shown during permission checks
- Graceful degradation for insufficient permissions
- Consistent UI patterns across all pages

## Performance Considerations

### Database Optimization
- Indexed foreign keys for RBAC joins
- Login history indexing for analytics
- Feature caching in frontend

### User Experience
- Minimal permission check overhead
- Efficient navigation rendering
- Background permission updates

## Integration Points

### External Services
- **Supabase**: Authentication, database, real-time updates
- **Vercel**: Hosting, file uploads via Blob storage
- **Email**: Contact form submissions, notifications

### Internal APIs
- User management endpoints
- RBAC administration endpoints  
- Business data endpoints (games, draws, insights)
- File upload endpoints

## Future Considerations

### Scalability
- Additional game types and configurations
- Advanced analytics and insight types
- Real-time collaboration features
- Mobile app integration

### Business Growth
- Multi-tenant support for different lottery organizations
- Advanced reporting and export capabilities
- API access for external integrations
- Premium feature tiers

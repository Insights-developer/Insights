# Insights App TypeScript Types Reference

**Company**: Lottery Analytics  
**Application**: Insights  
**Status**: In Development  

## Location
All types are centralized in `/frontend/utils/types.ts`

## Core User Types

### UserProfile
```typescript
export interface UserProfile {
  id: string;                           // UUID from Supabase Auth
  email: string;
  role?: string;                        // DEPRECATED - use Access Groups instead
  username?: string;                    // Optional display name
  phone?: string;                       // Optional contact info
  name?: string;                        // Optional full name
  avatar_url?: string;                  // Optional profile image
  created_at?: string;                  // Account creation timestamp
  last_login_at?: string;               // Legacy field
  current_login_at?: string;            // Current session start
  previous_login_at?: string;           // Previous session start
  login_count?: number;                 // Total login count (default: 0)
  is_active?: boolean;                  // Account status (default: true)
}
```

### UserWithGroups
```typescript
export interface UserWithGroups extends UserProfile {
  groups: AccessGroup[];                // User's assigned access groups
}
```

## RBAC Types

### AccessGroup
```typescript
export interface AccessGroup {
  id: number;
  name: string;                         // e.g., "Admins", "Premium Users"
  description?: string | null;          // Optional group description
}
```

### Feature
```typescript
export interface Feature {
  id: number;
  key: string;                          // Unique identifier (e.g., "admin_dashboard")
  name: string;                         // Human-readable name
  description?: string | null;          // Feature description
  type?: string;                        // 'page', 'card', 'widget', etc. (default: 'feature')
  nav_name?: string | null;             // Label for navigation
  icon_url?: string | null;             // Navigation icon URL
  order?: number;                       // Display order (default: 0)
  url?: string | null;                  // Page URL (defaults to /key)
  active?: boolean;                     // Enable/disable (default: true)
  created_by?: string | null;           // User who created feature
}
```

### UserAccessGroup
```typescript
export interface UserAccessGroup {
  user_id: string;                      // References UserProfile.id
  group_id: number;                     // References AccessGroup.id
}
```

### AccessGroupFeature
```typescript
export interface AccessGroupFeature {
  group_id: number;                     // References AccessGroup.id
  feature: string;                      // References Feature.key
}
```

## Business Logic Types

### Game
```typescript
export interface Game {
  id: number;
  name: string;                         // Game name (e.g., "Powerball")
  config?: object | null;               // Game configuration (JSON)
  created_at?: string;
  updated_at?: string;
}
```

### Draw
```typescript
export interface Draw {
  id: number;
  game_id?: number | null;              // References Game.id
  draw_date: string;                    // Date of draw (ISO format)
  results: number[];                    // Main numbers drawn
  bonus?: number[] | null;              // Bonus/powerball numbers
  uploaded_by?: string | null;          // References UserProfile.id
  created_at?: string;
}
```

### InsightTemplate
```typescript
export interface InsightTemplate {
  id: number;
  template_name: string;                // Analysis type name
  description?: string | null;          // What this insight provides
  config?: object | null;               // Analysis parameters (JSON)
  created_at?: string;
}
```

## Communication Types

### ContactMessage
```typescript
export interface ContactMessage {
  id: number;
  user_id?: string | null;              // References UserProfile.id (optional)
  name?: string | null;                 // Contact name
  email: string;                        // Contact email (required)
  message: string;                      // Message content (required)
  submitted_at?: string;                // Submission timestamp
}
```

### Notification
```typescript
export interface Notification {
  id: number;
  user_id?: string | null;              // References UserProfile.id
  notif_type?: string | null;           // Notification category
  data?: object | null;                 // Notification data (JSON)
  created_at?: string;
  read_at?: string | null;              // When notification was read
}
```

## System Types

### Upload
```typescript
export interface Upload {
  id: number;
  user_id?: string | null;              // References UserProfile.id
  filename?: string | null;             // Original filename
  blob_url?: string | null;             // Vercel Blob storage URL
  uploaded_at?: string;                 // Upload timestamp
}
```

### LoginHistory
```typescript
export interface LoginHistory {
  id: number;
  user_id: string;                      // References UserProfile.id
  login_at?: string;                    // Login timestamp
  ip_address?: string | null;           // IP address (inet type)
  user_agent?: string | null;           // Browser/device info
}
```

## Database Schema Type

### Database
```typescript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          email: string;
          role?: string;
          created_at?: string;
        };
        Update: {
          email?: string;
          role?: string;
          created_at?: string;
        };
      };
      access_groups: {
        Row: AccessGroup;
        Insert: {
          name: string;
          description?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
        };
      };
      user_access_groups: {
        Row: UserAccessGroup;
        Insert: {
          user_id: string;
          group_id: number;
        };
        Update: {
          user_id?: string;
          group_id?: number;
        };
      };
      features: {
        Row: Feature;
        Insert: {
          key: string;
          name: string;
          description?: string | null;
        };
        Update: {
          key?: string;
          name?: string;
          description?: string | null;
        };
      };
      access_group_features: {
        Row: AccessGroupFeature;
        Insert: {
          group_id: number;
          feature: string;
        };
        Update: {
          group_id?: number;
          feature?: string;
        };
      };
      // ... other tables follow same pattern
    };
  };
};
```

## Hook Return Types

### useRequireFeature Return Type
```typescript
interface UseRequireFeatureReturn {
  allowed: boolean;                     // Whether user has the required feature
  loading: boolean;                     // Whether permission check is in progress
}
```

## API Response Types

### Standard API Response
```typescript
interface ApiResponse<T = any> {
  data?: T;                             // Success data
  message?: string;                     // Success message
  error?: string;                       // Error message
}
```

### User Features Response
```typescript
interface UserFeaturesResponse {
  features: string[];                   // Array of feature keys user has access to
}
```

### Navigation Response
```typescript
interface NavigationItem {
  key: string;                          // Feature key
  name: string;                         // Display name
  url: string;                          // Page URL
  icon_url?: string;                    // Icon URL
  order: number;                        // Display order
  type: string;                         // 'page', 'card', etc.
}

interface NavigationResponse {
  items: NavigationItem[];              // Navigation items user can access
}
```

## Utility Types

### Common Props Types
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditModalProps<T> extends ModalProps {
  onSave: (data: T) => void;
  initialData?: T;
}

interface ConfirmModalProps extends ModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}
```

## Type Guards & Validation
```typescript
// Type guard for checking if user has groups
export function hasGroups(user: UserProfile | UserWithGroups): user is UserWithGroups {
  return 'groups' in user && Array.isArray(user.groups);
}

// Type for form validation
export interface FormError {
  field: string;
  message: string;
}
```

## Import Usage
```typescript
// Import specific types
import { UserProfile, AccessGroup, Feature } from '@/utils/types';

// Import database type for Supabase
import { Database } from '@/utils/types';
```

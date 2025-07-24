# Insights App Database Schema Documentation

> **Auto-Generated**: This file was automatically generated from the live database schema  
> **Generated On**: 2025-07-23 21:53:53  
> **Source**: Insights Maintenance Tool  

## Overview
The Insights app uses a PostgreSQL database with a sophisticated Access Group permission system. The schema supports lottery game management, user authentication, and flexible permission management.

## Database Architecture

### Core Concepts
- **Users**: Authenticated via Supabase, stored in custom users table
- **Access Groups**: Group-based permissions using access groups and features
- **Games & Draws**: Lottery game management and draw tracking
- **Insights**: Analytics and pattern recognition templates
- **Audit Trail**: Login history and activity tracking

### Schema Version
Auto-generated from live database  
Primary Schema File: `/frontend/schema/database-schema.sql`

---

## Table Definitions

### 👥 User Management Tables

#### `login_history`
**Purpose**: Detailed login audit trail
```sql
CREATE TABLE login_history (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id UUID NOT NULL,
    login_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    ip_address INET,
    user_agent TEXT
);
```

**Indexes**:
- `login_history_pkey`: CREATE UNIQUE INDEX login_history_pkey ON public.login_history USING btree (id)
- `idx_login_history_user_id`: CREATE INDEX idx_login_history_user_id ON public.login_history USING btree (user_id)
- `idx_login_history_login_at`: CREATE INDEX idx_login_history_login_at ON public.login_history USING btree (login_at)

**Foreign Keys**:
- `user_id` → `users(id)`

---

#### `users`
**Purpose**: Core user information and authentication data
```sql
CREATE TABLE users (
    id UUID NOT NULL,                    -- UUID from Supabase Auth,
    email CHARACTER VARYING NOT NULL,    -- Unique email address,
    role CHARACTER VARYING DEFAULT 'member'::character varying, -- Legacy field (deprecated),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    username TEXT,                       -- Optional display name,
    phone TEXT,                          -- Optional contact info,
    current_login_at TIMESTAMP WITHOUT TIME ZONE, -- Current session start,
    previous_login_at TIMESTAMP WITHOUT TIME ZONE, -- Previous session start,
    login_count INTEGER DEFAULT 0,       -- Total login count (default: 0),
    PRIMARY KEY (id)
);
```

**Key Points**:
- `id` must match Supabase Auth user ID
- `role` field is deprecated - use Access Groups instead
- Login tracking supports analytics and security
- Email must be unique across all users

**Indexes**:
- `users_pkey`: CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id)
- `users_email_key`: CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email)
- `idx_users_login_tracking`: CREATE INDEX idx_users_login_tracking ON public.users USING btree (current_login_at, previous_login_at)

---

### 🔐 Access Group Permission Tables

#### `access_group_features`
**Purpose**: Many-to-many relationship between groups and features
```sql
CREATE TABLE access_group_features (
    group_id INTEGER NOT NULL,
    feature CHARACTER VARYING NOT NULL,
    PRIMARY KEY (group_id, feature)
);
```

**Key Points**:
- Determines which features each group can access
- Users inherit ALL features from ALL their groups
- Changes immediately affect user permissions

**Indexes**:
- `access_group_features_pkey`: CREATE UNIQUE INDEX access_group_features_pkey ON public.access_group_features USING btree (group_id, feature)

**Foreign Keys**:
- `feature` → `features(key)`
- `group_id` → `access_groups(id)`

---

#### `access_groups`
**Purpose**: Logical groupings of users with similar access needs
```sql
CREATE TABLE access_groups (
    id INTEGER NOT NULL PRIMARY KEY,
    name CHARACTER VARYING NOT NULL,
    description TEXT
);
```

**Indexes**:
- `access_groups_pkey`: CREATE UNIQUE INDEX access_groups_pkey ON public.access_groups USING btree (id)

---

#### `features`
**Purpose**: Define app capabilities that can be granted or restricted
```sql
CREATE TABLE features (
    id INTEGER NOT NULL PRIMARY KEY,
    key CHARACTER VARYING NOT NULL,      -- Unique identifier (e.g., "admin_dashboard"),
    name CHARACTER VARYING NOT NULL,     -- Human-readable name,
    description TEXT,
    type CHARACTER VARYING DEFAULT 'feature'::character varying, -- 'page', 'card', 'widget', etc.,
    nav_name CHARACTER VARYING,          -- Navigation display name,
    icon_url TEXT,
    order INTEGER DEFAULT 0,             -- Display order (default: 0),
    url CHARACTER VARYING,
    active BOOLEAN DEFAULT true,         -- Enable/disable (default: true),
    created_by UUID
);
```

**Key Points**:
- `key` field used for permission checks in code
- `active` field allows enabling/disabling features
- `type` field categorizes features (page, card, widget)
- `order` field controls navigation display order

**Indexes**:
- `features_pkey`: CREATE UNIQUE INDEX features_pkey ON public.features USING btree (id)
- `features_key_key`: CREATE UNIQUE INDEX features_key_key ON public.features USING btree (key)

---

#### `user_access_groups`
**Purpose**: Many-to-many relationship between users and access groups
```sql
CREATE TABLE user_access_groups (
    user_id UUID NOT NULL,
    group_id INTEGER NOT NULL,
    PRIMARY KEY (user_id, group_id)
);
```

**Key Points**:
- Users can belong to multiple groups
- Groups can contain multiple users
- Cascade delete maintains referential integrity

**Indexes**:
- `user_access_groups_pkey`: CREATE UNIQUE INDEX user_access_groups_pkey ON public.user_access_groups USING btree (user_id, group_id)

**Foreign Keys**:
- `group_id` → `access_groups(id)`
- `user_id` → `users(id)`

---

### 🎮 Business Logic Tables

#### `draws`
**Purpose**: Record actual lottery draw results
```sql
CREATE TABLE draws (
    id INTEGER NOT NULL PRIMARY KEY,
    game_id INTEGER,
    draw_date DATE NOT NULL,             -- When the draw occurred,
    results ARRAY NOT NULL,              -- Main numbers drawn,
    bonus ARRAY,                         -- Bonus/powerball numbers,
    uploaded_by UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
```

**Indexes**:
- `draws_pkey`: CREATE UNIQUE INDEX draws_pkey ON public.draws USING btree (id)

**Foreign Keys**:
- `game_id` → `games(id)`
- `uploaded_by` → `users(id)`

---

#### `games`
**Purpose**: Define lottery games available for tracking
```sql
CREATE TABLE games (
    id INTEGER NOT NULL PRIMARY KEY,
    name CHARACTER VARYING NOT NULL,
    config JSONB,                        -- Game-specific configuration (JSON),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
```

**Indexes**:
- `games_pkey`: CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id)

---

#### `insight_templates`
**Purpose**: Define reusable analysis templates
```sql
CREATE TABLE insight_templates (
    id INTEGER NOT NULL PRIMARY KEY,
    template_name CHARACTER VARYING NOT NULL,
    description TEXT,
    config JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
```

**Indexes**:
- `insight_templates_pkey`: CREATE UNIQUE INDEX insight_templates_pkey ON public.insight_templates USING btree (id)

---

### 💬 Communication Tables

#### `notifications`
**Purpose**: In-app notification system
```sql
CREATE TABLE notifications (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id UUID,
    notif_type CHARACTER VARYING,
    data JSONB,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITHOUT TIME ZONE
);
```

**Indexes**:
- `notifications_pkey`: CREATE UNIQUE INDEX notifications_pkey ON public.notifications USING btree (id)

**Foreign Keys**:
- `user_id` → `users(id)`

---

### 📁 File Management Tables

#### `uploads`
**Purpose**: Track file uploads and blob storage
```sql
CREATE TABLE uploads (
    id INTEGER NOT NULL PRIMARY KEY,
    user_id UUID,
    filename CHARACTER VARYING,
    blob_url TEXT,
    uploaded_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now()
);
```

**Indexes**:
- `uploads_pkey`: CREATE UNIQUE INDEX uploads_pkey ON public.uploads USING btree (id)

**Foreign Keys**:
- `user_id` → `users(id)`

---

## Relationships & Constraints

### Access Group Permission Flow
```
User → user_access_groups → access_groups → access_group_features → features
```

### Business Logic Flow
```
User → uploads → draws → games
User → contact_messages
User → notifications
User → login_history
```

## Common Queries

### Get User Permissions
```sql
SELECT DISTINCT f.key
FROM users u
JOIN user_access_groups ug ON u.id = ug.user_id
JOIN access_groups g ON ug.group_id = g.id
JOIN access_group_features gf ON g.id = gf.group_id
JOIN features f ON gf.feature = f.key
WHERE u.id = $1 AND f.active = true;
```

### Get User with Groups
```sql
SELECT u.*, g.name as group_name, g.description as group_description
FROM users u
LEFT JOIN user_access_groups ug ON u.id = ug.user_id
LEFT JOIN access_groups g ON ug.group_id = g.id
WHERE u.id = $1;
```

---

*This documentation was automatically generated from the live database schema.*

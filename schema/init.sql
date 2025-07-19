-- ====================================================
-- SCHEMA MIGRATION: Align users table with Supabase Auth
-- Date: 2025-07-19

-- 1. Drop dependent tables to avoid FK conflicts
DROP TABLE IF EXISTS uploads, notifications, user_access_groups, access_groups, draws, games, insight_templates, users CASCADE;

-- 2. Recreate USERS table with UUID PK, no hashed_password
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,  -- Supabase Auth user id, assigned from auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Recreate ACCESS GROUPS tables
CREATE TABLE IF NOT EXISTS access_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_access_groups (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES access_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

-- 4. Recreate GAMES
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Recreate DRAWS
CREATE TABLE IF NOT EXISTS draws (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    draw_date DATE NOT NULL,
    results INTEGER[] NOT NULL,
    bonus INTEGER[],
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. INSIGHT TEMPLATES
CREATE TABLE IF NOT EXISTS insight_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notif_type VARCHAR(40),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- 8. FILE UPLOADS TRACKING
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255),
    blob_url TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Versioning comment
-- 2025-07-19: Schema migrated for Supabase Auth compatibility, uuid PKs for users, FKs updated.

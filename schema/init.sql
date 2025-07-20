-- schema/init.sql
-- ====================================================
-- Main Database Schema for Insights Lottery App
-- Updated: 2025-07-19 8:02 PM EDT
-- 
-- Changes:
-- * users table uses UUID PK matching auth.users
-- * removed hashed_password (Supabase Auth handles this)
-- * user_id FKs updated to UUID
-- * trigger keeps users table synced with Supabase Auth

-- === USERS TABLE ===
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,                 -- Matches auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP DEFAULT NOW()
);

-- === GAMES TABLE ===
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- === DRAWS TABLE ===
CREATE TABLE IF NOT EXISTS draws (
    id SERIAL PRIMARY KEY,
    game_id INTEGER REFERENCES games(id) ON DELETE CASCADE,
    draw_date DATE NOT NULL,
    results INTEGER[] NOT NULL,
    bonus INTEGER[],
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === INSIGHT TEMPLATES TABLE ===
CREATE TABLE IF NOT EXISTS insight_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === ACCESS GROUPS (RBAC) ===
CREATE TABLE IF NOT EXISTS access_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- === USER <-> ACCESS GROUPS LINK TABLE ===
CREATE TABLE IF NOT EXISTS user_access_groups (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES access_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

-- === NOTIFICATIONS TABLE ===
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notif_type VARCHAR(40),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- === FILE UPLOADS TRACKING TABLE ===
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    filename VARCHAR(255),
    blob_url TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- === AUTH SYNC TRIGGER ===
-- Automatically insert new user into users table when created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

-- === Version Control Comment ===
-- 2025-07-19: Schema migrated for Supabase Auth UUID PK, FKs updated, trigger added for sync.

-- schema/database-schema.sql
-- ====================================================
-- Main Database Schema for Insights Lottery App
-- Updated: 2025-07-20

-- RBAC & Profile Updates:
-- + Added features and access_group_features tables for RBAC
-- + Added phone and username to users table

-- === USERS TABLE ===
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,                             -- Matches auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'member',               -- Legacy, use RBAC instead
    username VARCHAR(100),                           -- new
    phone VARCHAR(30),                               -- new
    name VARCHAR(100),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
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
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- === USER <-> ACCESS GROUPS LINK TABLE ===
CREATE TABLE IF NOT EXISTS user_access_groups (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES access_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

-- === FEATURES TABLE (RBAC) ===
CREATE TABLE IF NOT EXISTS features (
    id SERIAL PRIMARY KEY,
    key VARCHAR(60) NOT NULL UNIQUE,        -- e.g., 'admin_dashboard', 'games_page'
    name VARCHAR(80) NOT NULL,              -- Human-friendly label
    nav_name VARCHAR(80),                   -- Label for nav cards/widgets (optional)
    description TEXT,
    url VARCHAR(255),                       -- Optional; if not set, defaults to /key
    icon_url VARCHAR(255),                  -- Animated/static icon URL (optional)
    order INTEGER DEFAULT 0,                -- Order for nav/cards
    type VARCHAR(32) DEFAULT 'feature',     -- 'page', 'card', 'widget', etc.
    active BOOLEAN DEFAULT TRUE
);

-- === ACCESS GROUP <-> FEATURES LINK TABLE (RBAC) ===
CREATE TABLE IF NOT EXISTS access_group_features (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES access_groups(id) ON DELETE CASCADE,
    feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
    UNIQUE (group_id, feature_id)
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

-- === CONTACT FORM MESSAGES TABLE ===
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW()
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
-- 2025-07-21: Design system, feature metadata expansion (nav/card/widgets), icon_url, order/type/active for features, contact_messages, last_login_at, is_active, full admin RBAC infrastructure.


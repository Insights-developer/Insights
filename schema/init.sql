-- schema/init.sql
-- ====================================================
-- Main Database Schema for the Insights Lottery App
-- Place this file in your ./schema directory

-- === USERS TABLE ===
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
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
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- === INSIGHT TEMPLATES TABLE ===
CREATE TABLE IF NOT EXISTS insight_templates (
    id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    config JSONB, -- weights, custom logic, etc
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
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    group_id INTEGER REFERENCES access_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, group_id)
);

-- === NOTIFICATIONS TABLE ===
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    notif_type VARCHAR(40),
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- === FILE UPLOADS TRACKING TABLE ===
CREATE TABLE IF NOT EXISTS uploads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename VARCHAR(255),
    blob_url TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- === Version Control Comment ===
-- (If you make changes, add a brief summary and a date. For bigger teams, use a migration tool or extra files.)
-- -- 2025-07-19: 6:22 PM EST Initial schema.

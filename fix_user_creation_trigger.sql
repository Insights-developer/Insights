-- Fix User Creation Trigger
-- This script deploys the missing trigger and creates the proper access group structure

-- 1. Create proper access groups for verified and unverified users
-- First, check if the groups already exist to avoid duplicates
DO $$
BEGIN
    -- Insert Guest group if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM access_groups WHERE name = 'Guest') THEN
        INSERT INTO access_groups (name, description) 
        VALUES ('Guest', 'Default group for unverified users - limited access');
    END IF;
    
    -- Insert Member group if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM access_groups WHERE name = 'Member') THEN
        INSERT INTO access_groups (name, description) 
        VALUES ('Member', 'Default group for verified users - full access');
    END IF;
END $$;

-- 2. Create basic features that users should have access to
INSERT INTO features (key, name, description, type, nav_name, icon_url, "order", url, active) 
VALUES 
    ('dashboard_page', 'Dashboard', 'Main dashboard page', 'page', 'Dashboard', null, 1, '/dashboard', true),
    ('profile_page', 'Profile', 'User profile page', 'page', 'Profile', null, 2, '/profile', true),
    ('contact_page', 'Contact', 'Contact form page', 'page', 'Contact', null, 3, '/contact', true)
ON CONFLICT (key) DO NOTHING;

-- 3. Assign limited features to Guest group (unverified users)
DO $$
BEGIN
    INSERT INTO access_group_features (group_id, feature)
    SELECT ag.id, f.key
    FROM access_groups ag, features f
    WHERE ag.name = 'Guest' 
    AND f.key IN ('profile_page', 'contact_page')
    AND NOT EXISTS (
        SELECT 1 FROM access_group_features agf 
        WHERE agf.group_id = ag.id AND agf.feature = f.key
    );
END $$;

-- 4. Assign full features to Member group (verified users)
DO $$
BEGIN
    INSERT INTO access_group_features (group_id, feature)
    SELECT ag.id, f.key
    FROM access_groups ag, features f
    WHERE ag.name = 'Member' 
    AND f.key IN ('dashboard_page', 'profile_page', 'contact_page')
    AND NOT EXISTS (
        SELECT 1 FROM access_group_features agf 
        WHERE agf.group_id = ag.id AND agf.feature = f.key
    );
END $$;

-- 5. Create the trigger function that assigns groups based on email verification status
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
DECLARE
    guest_group_id INTEGER;
    member_group_id INTEGER;
    is_verified BOOLEAN;
BEGIN
    -- Get the group IDs
    SELECT id INTO guest_group_id 
    FROM access_groups 
    WHERE name = 'Guest' 
    LIMIT 1;
    
    SELECT id INTO member_group_id 
    FROM access_groups 
    WHERE name = 'Member' 
    LIMIT 1;
    
    -- Check if email is verified (email_confirmed_at is not null)
    is_verified := NEW.email_confirmed_at IS NOT NULL;
    
    -- Insert new user into users table
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    
    -- Assign user to appropriate group based on verification status
    IF is_verified AND member_group_id IS NOT NULL THEN
        -- Verified users go to Member group
        INSERT INTO public.user_access_groups (user_id, group_id)
        VALUES (NEW.id, member_group_id)
        ON CONFLICT (user_id, group_id) DO NOTHING;
    ELSIF NOT is_verified AND guest_group_id IS NOT NULL THEN
        -- Unverified users go to Guest group
        INSERT INTO public.user_access_groups (user_id, group_id)
        VALUES (NEW.id, guest_group_id)
        ON CONFLICT (user_id, group_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create an additional trigger for email verification updates
-- This handles when users verify their email after initial signup
CREATE OR REPLACE FUNCTION public.handle_auth_user_update()
RETURNS trigger AS $$
DECLARE
    guest_group_id INTEGER;
    member_group_id INTEGER;
    was_verified BOOLEAN;
    is_now_verified BOOLEAN;
BEGIN
    -- Get the group IDs
    SELECT id INTO guest_group_id FROM access_groups WHERE name = 'Guest' LIMIT 1;
    SELECT id INTO member_group_id FROM access_groups WHERE name = 'Member' LIMIT 1;
    
    -- Check verification status
    was_verified := OLD.email_confirmed_at IS NOT NULL;
    is_now_verified := NEW.email_confirmed_at IS NOT NULL;
    
    -- If user just verified their email, promote them from Guest to Member
    IF NOT was_verified AND is_now_verified THEN
        -- Remove from Guest group
        DELETE FROM public.user_access_groups 
        WHERE user_id = NEW.id AND group_id = guest_group_id;
        
        -- Add to Member group
        INSERT INTO public.user_access_groups (user_id, group_id)
        VALUES (NEW.id, member_group_id)
        ON CONFLICT (user_id, group_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
    AFTER UPDATE ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_auth_user_update();

-- 8. Fix any existing users who might be missing from the database
-- This will create user records for anyone who exists in auth.users but not in public.users
DO $$
BEGIN
    INSERT INTO public.users (id, email)
    SELECT au.id, au.email 
    FROM auth.users au
    LEFT JOIN public.users u ON au.id = u.id
    WHERE u.id IS NULL;
END $$;

-- 9. Assign existing users to appropriate groups based on their verification status
-- First, assign verified users to Member group
DO $$
BEGIN
    INSERT INTO public.user_access_groups (user_id, group_id)
    SELECT au.id, ag.id
    FROM auth.users au
    CROSS JOIN access_groups ag
    LEFT JOIN user_access_groups uag ON au.id = uag.user_id
    WHERE ag.name = 'Member'
    AND au.email_confirmed_at IS NOT NULL  -- Verified users
    AND uag.user_id IS NULL;  -- Not already in any group
END $$;

-- Then, assign unverified users to Guest group
DO $$
BEGIN
    INSERT INTO public.user_access_groups (user_id, group_id)
    SELECT au.id, ag.id
    FROM auth.users au
    CROSS JOIN access_groups ag
    LEFT JOIN user_access_groups uag ON au.id = uag.user_id
    WHERE ag.name = 'Guest'
    AND au.email_confirmed_at IS NULL  -- Unverified users
    AND uag.user_id IS NULL;  -- Not already in any group
END $$;

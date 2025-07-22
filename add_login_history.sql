-- SQL Script to Add Login History Tracking
-- Run this on your database server to enable login history for the user info box

-- Add login tracking columns to the users table
ALTER TABLE users 
ADD COLUMN current_login_at timestamp without time zone,
ADD COLUMN previous_login_at timestamp without time zone,
ADD COLUMN login_count integer DEFAULT 0;

-- Create an index for better performance on login queries
CREATE INDEX idx_users_login_tracking ON users(current_login_at, previous_login_at);

-- Update existing users to have a login count of 1 if they don't have one
UPDATE users 
SET login_count = 1 
WHERE login_count IS NULL OR login_count = 0;

-- Optional: Create a login_history table for detailed tracking (if you want more granular history)
-- Create sequence for login_history first
CREATE SEQUENCE login_history_id_seq;

CREATE TABLE login_history (
  id integer NOT NULL DEFAULT nextval('login_history_id_seq'::regclass),
  user_id uuid NOT NULL,
  login_at timestamp without time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  PRIMARY KEY (id)
);

-- Add foreign key constraint
ALTER TABLE login_history ADD FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_login_at ON login_history(login_at);

-- Example function to update login timestamps (optional - can be done in application code)
CREATE OR REPLACE FUNCTION update_user_login(user_uuid uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET 
    previous_login_at = current_login_at,
    current_login_at = now(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql;

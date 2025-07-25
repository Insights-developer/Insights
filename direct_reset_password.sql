-- direct_reset_password.sql
-- This script can be run directly in the Supabase SQL Editor
-- to reset a user's password without requiring a reset token

-- Make sure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create hash_password function if it doesn't exist
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf', 12)); -- bcrypt with work factor 12
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- First drop the existing verify_password function if it exists
DROP FUNCTION IF EXISTS public.verify_password(text, text);

-- Then create our verify_password function with the correct parameter names
CREATE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean AS $$
BEGIN
  RETURN (hash = crypt(password, hash));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset the password for a specific user
-- Replace 'developer@lotteryanalytics.app' with the actual email
-- Replace 'new-password-123' with the desired password
DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'developer@lotteryanalytics.app';
  v_password TEXT := 'Admin1403!zx'; -- Change this to the desired password
  v_hashed_password TEXT;
BEGIN
  -- Find user ID
  SELECT id INTO v_user_id 
  FROM auth.users
  WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', v_email;
  END IF;
  
  -- Generate password hash
  SELECT hash_password(v_password) INTO v_hashed_password;
  
  -- Update in auth.users table (Supabase Auth)
  -- Always update the encrypted_password column
  UPDATE auth.users
  SET 
    encrypted_password = v_hashed_password
  WHERE id = v_user_id;
  
  -- Try to update additional fields if they exist
  BEGIN
    UPDATE auth.users
    SET failed_login_attempts = 0
    WHERE id = v_user_id;
    RAISE NOTICE 'Reset failed_login_attempts in auth.users';
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'Column failed_login_attempts does not exist in auth.users';
  END;
  
  -- Update in custom users table if it exists
  -- Try to update with all fields first
  BEGIN
    UPDATE users
    SET 
      password_hash = v_hashed_password,
      failed_login_attempts = 0,
      account_locked = false
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Password updated in both auth.users and users tables (with all fields)';
  EXCEPTION 
    WHEN undefined_table THEN
      RAISE NOTICE 'Custom users table not found, only auth.users was updated';
    WHEN undefined_column THEN
      -- Try a more conservative update with just the password_hash field
      BEGIN
        UPDATE users
        SET password_hash = v_hashed_password
        WHERE id = v_user_id;
        
        RAISE NOTICE 'Password updated in both auth.users and users tables (password only)';
      EXCEPTION 
        WHEN undefined_column THEN
          RAISE NOTICE 'Password hash column not found in users table, only auth.users was updated';
        WHEN undefined_table THEN
          RAISE NOTICE 'Custom users table not found, only auth.users was updated';
      END;
  END;
  
  RAISE NOTICE 'Password has been reset for user %', v_email;
  
  -- Verify that the password was updated correctly
  DECLARE
    v_verification boolean;
    v_stored_hash text;
  BEGIN
    -- Get the stored hash
    SELECT encrypted_password INTO v_stored_hash
    FROM auth.users
    WHERE id = v_user_id;
    
    -- Manual verification using pgcrypto directly (more reliable)
    SELECT (v_stored_hash = crypt(v_password, v_stored_hash)) INTO v_verification;
    
    IF v_verification THEN
      RAISE NOTICE 'Password verification successful using direct pgcrypto check';
    ELSE
      RAISE WARNING 'Password verification failed using direct pgcrypto check';
    END IF;
    
    -- Try verify_password function as a backup verification method
    BEGIN
      SELECT verify_password(v_password, v_stored_hash) INTO v_verification;
      IF v_verification THEN
        RAISE NOTICE 'Password verification also successful using verify_password function';
      ELSE
        RAISE WARNING 'Password verification failed using verify_password function';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not verify with verify_password function: %', SQLERRM;
    END;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not verify password: %', SQLERRM;
  END;
END $$;

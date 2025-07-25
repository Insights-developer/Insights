-- Create verify_password function for database authentication
DROP FUNCTION IF EXISTS public.verify_password(text, text);

CREATE OR REPLACE FUNCTION public.verify_password(password text, hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result boolean;
BEGIN
  -- Use pgcrypto extension to verify password
  SELECT password = crypt(password, hash) INTO result;
  RETURN result;
EXCEPTION
  WHEN others THEN
    -- Return false on any error for security
    RETURN false;
END;
$$;

-- Grant execute permission to all users
GRANT EXECUTE ON FUNCTION public.verify_password(text, text) TO PUBLIC;

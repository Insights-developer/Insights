#!/bin/bash

echo "===== Running simplified password reset ====="

# Check if the script is set up with credentials
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_KEY" ]]; then
  echo "Using previously provided credentials..."
fi

# User details
EMAIL="developer@lotteryanalytics.app"
PASSWORD="Admin1403!zx"

# Create a simpler SQL command that just updates the password directly
SQL="
-- First, get the user ID
DO \$\$
DECLARE
  v_user_id UUID;
BEGIN
  -- Find user ID
  SELECT id INTO v_user_id 
  FROM auth.users
  WHERE email = '$EMAIL';
  
  -- Create hash_password function if it doesn't exist
  CREATE OR REPLACE FUNCTION public.temp_hash_password(password text)
  RETURNS text AS \$\$
  BEGIN
    RETURN crypt(password, gen_salt('bf', 12)); -- bcrypt with work factor 12
  END;
  \$\$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- Update the password
  UPDATE auth.users
  SET encrypted_password = temp_hash_password('$PASSWORD')
  WHERE id = v_user_id;
  
  -- Drop the temporary function
  DROP FUNCTION IF EXISTS public.temp_hash_password(text);
  
  RAISE NOTICE 'Password updated for %', '$EMAIL';
END \$\$;
"

echo "Executing simplified password reset..."
echo "Target user: $EMAIL"

# Execute the SQL via the Supabase API
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"$SQL\"}")

if [[ "$RESPONSE" == *"error"* ]]; then
  echo "ERROR: Failed to execute SQL script!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Password reset executed successfully!"
echo "Response: $RESPONSE"
echo -e "\nTry logging in with the updated password: $PASSWORD"

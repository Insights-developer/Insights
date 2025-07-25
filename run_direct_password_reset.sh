#!/bin/bash

echo "===== Running direct password reset script ====="

# Check if the script is set up with credentials
if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_SERVICE_KEY" ]]; then
  echo "Environment variables not set. Please provide Supabase credentials:"
  read -p "Supabase URL: " SUPABASE_URL
  read -p "Supabase service role key: " SUPABASE_SERVICE_KEY
  
  # Export for this session
  export SUPABASE_URL
  export SUPABASE_SERVICE_KEY
fi

# Read the SQL script content
SQL_FILE="direct_reset_password.sql"

if [[ ! -f "$SQL_FILE" ]]; then
  echo "ERROR: SQL file $SQL_FILE not found!"
  exit 1
fi

SQL_CONTENT=$(cat "$SQL_FILE")

echo "Executing password reset SQL..."
echo "Target user: developer@lotteryanalytics.app"

# Execute the SQL via the Supabase API
RESPONSE=$(curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"$SQL_CONTENT\"}")

if [[ "$RESPONSE" == *"error"* ]]; then
  echo "ERROR: Failed to execute SQL script!"
  echo "Response: $RESPONSE"
  exit 1
fi

echo "Password reset script executed successfully!"
echo "Response: $RESPONSE"
echo -e "\nTry logging in with the updated password: Admin1403!zx"

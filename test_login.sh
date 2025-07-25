#!/bin/bash

echo "===== Testing login with updated password ====="

# Login details
EMAIL="developer@lotteryanalytics.app"
PASSWORD="Admin1403!zx"

# First try Supabase auth directly
if [[ -n "$SUPABASE_URL" && -n "$SUPABASE_SERVICE_KEY" ]]; then
  echo -e "\n1. Testing Supabase Auth API directly..."
  
  ANON_KEY=$(echo "$SUPABASE_SERVICE_KEY" | sed 's/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[^.]*\./eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqbHV1bWJvc2hxeGhtbnJvcXhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTA2NTYsImV4cCI6MjA2ODUyNjY1Nn0./')
  
  RESPONSE=$(curl -s -X POST "$SUPABASE_URL/auth/v1/token?grant_type=password" \
    -H "apikey: $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  
  if [[ "$RESPONSE" == *"access_token"* ]]; then
    echo "Supabase Auth login SUCCESS! ✅"
    echo "Response contains a valid access token."
  else
    echo "Supabase Auth login FAILED! ❌"
    echo "Response: $RESPONSE"
  fi
fi

# Then try our custom login API
if [[ -d "/workspaces/Insights/frontend/app/api/auth/login" ]]; then
  echo -e "\n2. Testing our custom login API..."
  
  # Check if server is running
  echo "Note: This test requires the Next.js server to be running."
  echo "If the server is not running, you can test the login through the UI."
  
  read -p "Is the Next.js server running? (y/n): " SERVER_RUNNING
  
  if [[ "$SERVER_RUNNING" == "y" || "$SERVER_RUNNING" == "Y" ]]; then
    RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    
    if [[ "$RESPONSE" == *"token"* || "$RESPONSE" == *"success"* ]]; then
      echo "Custom login API SUCCESS! ✅"
      echo "Response: $RESPONSE"
    else
      echo "Custom login API FAILED! ❌"
      echo "Response: $RESPONSE"
    fi
  else
    echo "Skipping custom API test."
  fi
fi

echo -e "\nYou can now try logging in through the UI with:"
echo "Email: $EMAIL"
echo "Password: $PASSWORD"

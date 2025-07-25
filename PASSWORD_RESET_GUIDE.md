# Password Reset Guide

This document provides instructions on how to reset passwords in the Insights app.

## User-Initiated Password Reset

Users can reset their passwords using the "Forgot Password" feature in the login form:

1. Navigate to the login page
2. Click on "Forgot Password"
3. Enter your email address
4. Check your email for the reset link
5. Click the link and set a new password

## Administrative Password Reset

For administrators who need to reset a user's password:

### Option 1: Use the SQL Script

1. Open the Supabase SQL Editor
2. Load the `direct_reset_password.sql` script
3. Modify the email and password values:
   ```sql
   v_email TEXT := 'user@example.com';  -- Change to user's email
   v_password TEXT := 'new-password';   -- Change to desired password
   ```
4. Run the script
5. Inform the user of their new password

### Option 2: Use the Reset API

You can also use our API endpoints to reset a password:

1. Request a password reset token for the user's email:
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password-request \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com"}'
   ```

2. Get the reset token from the console logs (development only) or the database

3. Use the token to reset the password:
   ```bash
   curl -X POST http://localhost:3000/api/auth/reset-password-confirm \
     -H "Content-Type: application/json" \
     -d '{"token":"reset_token_here","password":"new-password-123"}'
   ```

## Troubleshooting

If users are unable to reset their passwords:

1. Check that the password reset functions exist in the database
2. Verify that user accounts exist in both `auth.users` and the custom `users` table
3. Check the password hash format (should be bcrypt format starting with `$2a$12$`)
4. Ensure the reset token is valid and not expired

## Security Notes

1. Password reset tokens expire after 1 hour
2. Tokens can only be used once
3. Password resets invalidate all existing sessions for the user
4. Passwords must be at least 8 characters long

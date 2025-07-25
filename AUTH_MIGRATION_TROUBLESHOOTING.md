# Authentication Migration Guide

## Overview

This guide provides step-by-step instructions to solve the login issues with the custom authentication system.

## Issue Diagnosis

We've identified that users are unable to login due to potential issues with:

1. Incorrect password hash format in the database
2. Issues with the verify_password() function in PostgreSQL
3. Incompatibility between the hash stored and the hash comparison logic

## Solution Steps

### 1. Apply Database Schema Updates

The `auth_migration_schema.sql` file contains the necessary functions for password hashing and verification.

```bash
# Set up environment variables first
source setup_env.sh

# Then apply the migration
./apply_auth_migration.sh
```

### 2. Update User Password Directly

If you have direct database access, run the `direct_password_update.sql` script in the Supabase SQL Editor or using psql:

```sql
-- This will:
-- 1. Create necessary functions (hash_password, verify_password)
-- 2. Update the password for the specified user
-- 3. Test that verification works
```

### 3. Test Login Functionality

After applying the changes, test the login functionality:

```bash
./test_login_direct.sh
```

## Troubleshooting

If login still doesn't work after applying these changes, check:

1. **Hash Format**: The hash in the database should start with `$2a$12$` (bcrypt format)
2. **API Endpoint**: Ensure the login API is correctly handling the verification
3. **Client-side Code**: Check if the login form is sending the correct data

### Diagnostic Commands

Use these commands to diagnose login issues:

```bash
# Check user account status
./debug_login_api.sh

# Directly update password in the database
./direct_password_update.sh
```

## Next Steps

After fixing the login issues, complete the authentication migration:

1. Implement email verification
2. Set up password reset functionality
3. Add session management endpoints
4. Update client-side authentication context

## Security Considerations

The implemented authentication system includes:

- Secure password hashing with bcrypt (work factor 12)
- Protection against brute force attacks via failed login tracking
- Secure session management with JWT tokens
- HTTP-only cookies for token storage

## Support

For additional help, contact the development team.

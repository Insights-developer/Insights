# Authentication System Migration

## Overview

This document outlines the migration process from Supabase Auth to our custom authentication system, including architecture, database schema, API endpoints, and implementation details.

## Architecture

Our new authentication system is built with the following components:

1. **Database Schema**: Custom tables for users, sessions, password resets, and email verification
2. **Authentication API**: REST endpoints for registration, login, session management, and password recovery
3. **JWT Authentication**: Secure session tokens using JWT signing and verification
4. **Middleware**: Route protection and session validation
5. **Client-Side Integration**: Authentication context and UI components

## Database Schema

The authentication system uses the following tables:

### users
- `id` (UUID): Primary key, unique identifier for each user
- `email` (TEXT): User's email address (unique)
- `password_hash` (TEXT): Bcrypt-hashed password
- `name` (TEXT): User's display name
- `created_at` (TIMESTAMP): When the user was created
- `updated_at` (TIMESTAMP): When the user was last updated
- `email_verified` (BOOLEAN): Whether the email has been verified
- `role` (TEXT): User role (e.g., user, admin)
- `last_login` (TIMESTAMP): Last successful login timestamp

### user_sessions
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users.id
- `token` (TEXT): Session token for validation
- `expires_at` (TIMESTAMP): When the session expires
- `created_at` (TIMESTAMP): When the session was created
- `ip_address` (TEXT): IP address of the client when session was created
- `user_agent` (TEXT): User agent string of the client

### verification_tokens
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users.id
- `token` (TEXT): Verification token
- `expires_at` (TIMESTAMP): When the token expires
- `created_at` (TIMESTAMP): When the token was created
- `used` (BOOLEAN): Whether the token has been used

### password_reset_tokens
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to users.id
- `token` (TEXT): Reset token
- `expires_at` (TIMESTAMP): When the token expires
- `created_at` (TIMESTAMP): When the token was created
- `used` (BOOLEAN): Whether the token has been used

## API Endpoints

The authentication system provides the following API endpoints:

### Registration and Login

- `POST /api/auth/register`: Create a new user account
- `POST /api/auth/login`: Authenticate a user and create a session
- `POST /api/auth/logout`: End the current session

### Session Management

- `POST /api/auth/refresh-session`: Refresh the current session token
- `GET /api/auth/session`: Get current session information

### Email Verification

- `GET /api/auth/verify-email`: Verify a user's email with token
- `POST /api/auth/resend-verification`: Resend verification email

### Password Management

- `POST /api/auth/reset-password-request`: Request a password reset
- `POST /api/auth/reset-password-confirm`: Reset password with token

## Security Features

Our custom authentication system includes the following security features:

1. **Password Hashing**: Using bcrypt with appropriate work factor
2. **JWT Tokens**: Secure session management with signed JWT tokens
3. **HTTP-Only Cookies**: Session tokens stored in HTTP-only cookies
4. **CSRF Protection**: Using SameSite cookie policy
5. **Session Expiration**: Automatic session expiration and refresh
6. **IP Tracking**: Logging IP addresses for session creation
7. **User Agent Tracking**: Logging user agents for session creation
8. **Email Verification**: Required email verification
9. **Rate Limiting**: Protection against brute force attacks
10. **Secure Password Reset**: One-time use tokens with expiration

## Migration Process

The migration from Supabase Auth involves the following steps:

1. **Schema Creation**: Set up the new authentication tables
2. **User Migration**: Copy existing users from Supabase Auth
3. **API Implementation**: Build new authentication endpoints
4. **Client Updates**: Update client-side authentication logic
5. **Testing**: Thorough testing of the new system
6. **Cutover**: Switch from Supabase Auth to custom auth
7. **Cleanup**: Remove Supabase Auth dependencies

## Migration Scripts

We've provided two SQL scripts to handle the migration:

### 1. `auth_migration_schema.sql`

This script creates all necessary tables, functions, and triggers for the authentication system:

```bash
psql -d your_database -f auth_migration_schema.sql
```

Key components:
- User session management tables
- Password reset functionality
- Email verification tables
- Security utility functions
- Database triggers for timestamps

### 2. `auth_migration_data.sql`

This script migrates existing users and creates initial sessions:

```bash
psql -d your_database -f auth_migration_data.sql
```

Key operations:
- Creates password hashes for existing users
- Sets up initial sessions
- Handles email verification status
- Creates cleanup maintenance functions
- Provides verification statistics

## Handling Migration Issues

The migration scripts are designed to handle variations in schema:

- If columns like `email_verified` don't exist, they'll be created automatically
- Verification and password reset tables are detected regardless of naming conventions
- Error handling is in place for common schema variations

If you encounter an error like `column email_verified does not exist`, the script will automatically add the missing column.

## Post-Migration Steps

After running the migration scripts:

1. **Password Reset Flow**: Implement a password reset flow for all users
2. **Email Notifications**: Inform users about the authentication system change
3. **Testing**: Verify login, registration, and password reset functionality
4. **Maintenance**: Set up scheduled cleanup tasks using the `cleanup_expired_auth_data()` function

Users will need to reset their passwords after migration since we cannot access their original password hashes from Supabase.

## Testing

A test script (`scripts/test-auth.ts`) is provided to verify the functionality of the authentication system, including:

1. User creation
2. Password authentication
3. Email verification
4. Password reset
5. Session management

## Client-Side Integration

The authentication system is integrated with our Next.js application using:

1. **AuthContext**: Manages authentication state and user sessions
2. **Middleware**: Protects routes requiring authentication
3. **API Integration**: Client-side API calls for authentication actions
4. **UI Components**: Login, registration, and password reset forms

## Environment Variables

The following environment variables are used by the authentication system:

- `JWT_SECRET`: Secret key for JWT signing and verification
- `NEXT_PUBLIC_APP_URL`: Base URL of the application
- `EMAIL_FROM`: Sender email address for authentication emails

## Dependencies

The authentication system depends on the following packages:

- `bcrypt`: Password hashing
- `jose`: JWT signing and verification
- `uuid`: Generating unique identifiers
- `postgres`: Database connection and queries

## Future Enhancements

Possible future enhancements to the authentication system include:

1. **Multi-factor Authentication**: Additional security layer
2. **Social Login Integration**: OAuth providers like Google, Facebook, etc.
3. **Device Management**: Allow users to view and manage active sessions
4. **Account Recovery Options**: Alternative recovery methods
5. **Enhanced Audit Logging**: More detailed logging of authentication events

## Troubleshooting

### Common Migration Issues

#### "column email_verified does not exist"
- The migration script will automatically add this column if it's missing
- If the script fails, manually add the column with: `ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT TRUE;`

#### "column s.expires_at does not exist"
- This occurs when the Supabase schema differs from expectations
- The migration script handles this automatically by checking for column existence
- Review your actual database schema and modify scripts if needed

#### Missing user data after migration
- Verify that the transaction completed successfully
- Check the migration summary statistics at the end of execution
- If needed, restore from backup and retry with modified scripts

#### Password reset issues
- Users must reset passwords because original hashes from Supabase are not transferable
- Ensure your password reset workflow is properly configured
- Test the complete reset flow before wide deployment

### Database Maintenance

- Run `SELECT cleanup_expired_auth_data();` periodically to clean expired sessions and tokens
- Consider enabling the pg_cron scheduler if available
- For Supabase, create an Edge Function with a scheduled trigger to run this cleanup

### Application Integration Issues

- Update your middleware to use the new session validation
- Ensure cookies are properly configured for secure, HTTP-only settings
- Test all authentication flows including error cases

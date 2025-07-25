# Complete Authentication Migration Plan
## Eliminating Supabase Auth Dependency

### Overview

This document outlines a complete plan to migrate from Supabase Auth to a fully custom authentication system managed entirely within our own database. This will give us full control over the authentication flow, eliminate external dependencies, and ensure reliable access to our application.

### Architecture

The new authentication system will consist of:

1. **Database Schema**: Custom tables for user authentication and management
2. **API Endpoints**: Secure routes for registration, login, verification, and password recovery
3. **Session Management**: Integration with our existing centralized session system
4. **Security Layer**: Proper password hashing, rate limiting, and token management

### Implementation Plan

## Phase 1: Database Schema Setup (2 days)

```sql
-- 1. Create secure password extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Enhance users table with auth fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS email_verification_token TEXT,
ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reset_password_token TEXT,
ADD COLUMN IF NOT EXISTS reset_password_expires TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- 3. Create email verification tracking
CREATE TABLE IF NOT EXISTS email_verification (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- 4. Create password reset tracking
CREATE TABLE IF NOT EXISTS password_reset (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- 5. Create session tracking table
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- 6. Create security functions
CREATE OR REPLACE FUNCTION hash_password(password TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION verify_password(password_attempt TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN password_hash = crypt(password_attempt, password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION generate_secure_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
```

## Phase 2: API Endpoints (5 days)

### Registration Endpoint
```typescript
// /api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { sendVerificationEmail } from '@/utils/email';
import { pool } from '@/utils/db'; // Direct PostgreSQL connection pool

export async function POST(request: NextRequest) {
  // Use a transaction for data consistency
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const { email, password, name } = await request.json();
    
    // Check if email already exists
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
      
    if (existingUserResult.rowCount > 0) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }
    
    // Create user with secure UUID
    const userId = uuidv4();
    const verificationTokenResult = await client.query(
      'SELECT generate_secure_token() AS token'
    );
    const verificationToken = verificationTokenResult.rows[0].token;
    
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 hour expiration
    
    // Hash password
    const passwordHashResult = await client.query(
      'SELECT hash_password($1) AS hash',
      [password]
    );
    const passwordHash = passwordHashResult.rows[0].hash;
    
    // Insert new user
    await client.query(
      'INSERT INTO users(id, email, password_hash, created_at, username) VALUES($1, $2, $3, $4, $5)',
      [userId, email, passwordHash, new Date().toISOString(), name || null]
    );
    
    // Create verification token
    await client.query(
      'INSERT INTO email_verification(user_id, token, expires_at) VALUES($1, $2, $3)',
      [userId, verificationToken, expires.toISOString()]
    );
    
    await client.query('COMMIT');
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json(
      { message: 'Registration successful. Please verify your email.' },
      { status: 201 }
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
```

### Login Endpoint
```typescript
// /api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSessionCookie } from '@/utils/auth';
import { pool } from '@/utils/db'; // Direct PostgreSQL connection pool

export async function POST(request: NextRequest) {
  // Use a transaction for consistent data operations
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const { email, password } = await request.json();
    
    // Get user by email
    const userResult = await client.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const passwordResult = await client.query(
      'SELECT verify_password($1, $2) AS valid',
      [password, user.password_hash]
    );
    
    const isValid = passwordResult.rows[0].valid;
    
    if (!isValid) {
      // Increment failed login attempts
      await client.query(
        'UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1',
        [user.id]
      );
      
      await client.query('COMMIT');
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Generate session token
    const tokenResult = await client.query('SELECT generate_secure_token() AS token');
    const sessionToken = tokenResult.rows[0].token;
    
    const expires = new Date();
    expires.setHours(expires.getHours() + 16); // 16 hour session
    
    // Create session record
    await client.query(
      'INSERT INTO user_sessions(user_id, token, expires_at, ip_address, user_agent) VALUES($1, $2, $3, $4, $5)',
      [
        user.id, 
        sessionToken, 
        expires.toISOString(), 
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      ]
    );
    
    // Reset failed attempts and update last login
    await client.query(
      'UPDATE users SET failed_login_attempts = 0, last_login = $1, current_login_at = $1 WHERE id = $2',
      [new Date().toISOString(), user.id]
    );
    
    // Get user features
    const featuresResult = await client.query(
      `SELECT f.key 
       FROM features f
       JOIN access_group_features agf ON f.key = agf.feature
       JOIN user_access_groups uag ON agf.group_id = uag.group_id
       WHERE uag.user_id = $1`,
      [user.id]
    );
    
    const features = featuresResult.rows.map(row => row.key);
    
    await client.query('COMMIT');
    
    // Set secure HTTP-only cookie
    const cookieValue = createSessionCookie(user.id, sessionToken, expires);
    cookies().set('session', cookieValue, {
      httpOnly: true,
      expires,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    return NextResponse.json({
      user: { id: user.id, email: user.email },
      features,
      sessionExpires: expires.toISOString()
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

### Additional Endpoints (similarly structured)
1. `/api/auth/verify-email/route.ts` - Email verification
2. `/api/auth/forgot-password/route.ts` - Password reset request
3. `/api/auth/reset-password/route.ts` - Password reset completion
4. `/api/auth/logout/route.ts` - Session termination
5. `/api/auth/refresh-session/route.ts` - Session refresh

## Phase 3: Auth Context Integration (3 days)

Modify the existing `AuthContext.tsx` to use the new authentication system:

```typescript
// Key changes to AuthContext.tsx
import { cookies } from 'next/cookies';

// Implement custom authentication methods
const signIn = async (email: string, password: string) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return { error: data.error || 'Login failed' };
    }
    
    // Update auth state with our custom session format
    setAuthState({
      user: data.user,
      session: {
        token: data.sessionToken,
        expires_at: new Date(data.sessionExpires).getTime() / 1000
      },
      features: data.features || [],
      loading: false,
      initialized: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { error: 'An unexpected error occurred' };
  }
};

// Replace session refresh with custom implementation
const refreshSession = async () => {
  try {
    const response = await fetch('/api/auth/refresh-session', {
      method: 'POST',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      // Update session expiration
      setAuthState(prev => ({
        ...prev,
        session: {
          ...prev.session,
          expires_at: new Date(data.sessionExpires).getTime() / 1000
        }
      }));
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
};
```

## Phase 4: UI Components (3 days)

Update the authentication logic in existing UI components while keeping the exact same design:

1. **Login Form** (`/app/components/AuthForm.tsx`) 
   - Keep the same UI design and styling
   - Only replace the Supabase authentication calls with our custom API calls
   - Preserve all existing UI states (loading, errors, etc.)
   
   ```tsx
   // Example of minimal changes to AuthForm.tsx (login function)
   // Keep all existing UI elements and only change the authentication logic
   
   // BEFORE (current code with Supabase):
   const { data, error } = await supabase.auth.signInWithPassword({ 
     email: email.trim(), 
     password: pw 
   });
   
   // AFTER (custom auth while keeping same UI):
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ 
       email: email.trim(), 
       password: pw 
     }),
     credentials: 'include'
   });
   
   const data = await response.json();
   const error = !response.ok ? { message: data.error } : null;
   ```

2. **Registration Form**
   - Preserve the same visual design and validation patterns
   - Only change the backend authentication calls

3. **Password Reset Forms**
   - Maintain identical look and feel
   - Replace only the underlying authentication logic

4. **Email Verification Success Page**
   - Keep the same design and messaging
   - Update only the verification check mechanism

5. **Account Management Page**
   - Preserve all UI components and layouts
   - Update only data fetching and update mechanisms

## Phase 5: Migration Process (2 days)

1. **Data Migration**: Script to securely transfer existing user credentials
   ```sql
   -- Step 1: Create migration function to securely transfer users
   CREATE OR REPLACE FUNCTION migrate_existing_users()
   RETURNS INTEGER AS $$
   DECLARE
     user_count INTEGER := 0;
     user_record RECORD;
   BEGIN
     -- For each existing user that doesn't have a password_hash yet
     FOR user_record IN 
       SELECT id, email 
       FROM users 
       WHERE password_hash IS NULL
     LOOP
       -- Set a temporary random password that requires reset
       UPDATE users
       SET 
         password_hash = crypt(encode(gen_random_bytes(16), 'hex'), gen_salt('bf')),
         reset_password_token = encode(gen_random_bytes(32), 'hex'),
         reset_password_expires = NOW() + INTERVAL '7 days'
       WHERE id = user_record.id;
       
       -- Track migration count
       user_count := user_count + 1;
     END LOOP;
     
     RETURN user_count;
   END;
   $$ LANGUAGE plpgsql SECURITY DEFINER;
   ```

2. **Transition Period**: Seamless user experience during migration
   - Send password reset emails to all users when ready
   - Users continue using the app normally
   - Each user transitions when they reset their password

3. **Cutover Strategy**: Phased implementation with zero downtime
   - Deploy database changes without affecting current system
   - Add new auth endpoints alongside existing ones
   - Switch auth context to use new endpoints
   - Remove old auth code after successful transition

4. **Rollback Plan**: Safety mechanisms if needed
   - Keep database backward compatible
   - Maintain ability to switch back to original auth if issues arise

## Phase 6: Testing & Deployment (3 days)

1. **Unit Tests**: For authentication logic
2. **Integration Tests**: For API endpoints
3. **End-to-End Tests**: For complete auth flows
4. **Security Audit**: Review for vulnerabilities
5. **Deployment**: Staged rollout

### Timeline

Total estimated time: **18 days**

- **Phase 1**: Days 1-2
- **Phase 2**: Days 3-7
- **Phase 3**: Days 8-10
- **Phase 4**: Days 11-13
- **Phase 5**: Days 14-15
- **Phase 6**: Days 16-18

### Benefits

1. **Full Control**: Complete ownership of authentication system
2. **Reliability**: No dependency on external services
3. **Integration**: Seamless connection with existing session management
4. **Cost Saving**: Reduced Supabase usage costs
5. **Performance**: Optimized directly for our specific needs
6. **Security**: Custom security measures and monitoring

### Next Steps

1. Approve architecture plan
2. Set up database schema
3. Implement core authentication endpoints
4. Begin UI component updates

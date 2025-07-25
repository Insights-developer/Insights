# Insights Application Project Design Document

## Project Overview

This document outlines the design and implementation plan for rebuilding the Insights application. The new system will use Vercel Postgres (Neon) for database operations, custom JWT-based authentication, and Tailwind CSS for styling.

## Core Technologies

- **Frontend**: Next.js with React and Tailwind CSS
- **Database**: Vercel Postgres (Neon) with the serverless driver
- **Authentication**: Custom JWT with bcrypt password hashing
- **Email Service**: Resend.com
- **Deployment**: Vercel

## System Architecture

### Authentication Flow

1. Users start at the AuthForm (home page - not a separate /login route)
2. New users register with email, password, and other details
3. System sends verification code via Resend.com (expires in 15 minutes)
4. Users enter verification code on AuthForm
5. System validates code and upgrades user from "Guest" to "Member"
6. JWT token is issued for authenticated sessions
7. Users are redirected to Dashboard

### Database Schema

#### Core Tables

**Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  phone VARCHAR(50),
  access_group_id UUID REFERENCES access_groups(id),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_code VARCHAR(8),
  verification_code_expires TIMESTAMP,
  current_login_at TIMESTAMP,
  previous_login_at TIMESTAMP,
  login_count INTEGER DEFAULT 0,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  account_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Access Groups Table**
```sql
CREATE TABLE access_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Navigation Items Table**
```sql
CREATE TABLE navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  url VARCHAR(255),
  icon VARCHAR(100),
  type VARCHAR(50) CHECK (type IN ('page', 'card')),
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Access Group Permissions Table**
```sql
CREATE TABLE access_group_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_group_id UUID REFERENCES access_groups(id),
  navigation_item_id UUID REFERENCES navigation_items(id),
  can_view BOOLEAN DEFAULT FALSE,
  can_create BOOLEAN DEFAULT FALSE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(access_group_id, navigation_item_id)
);
```

**Login History Table**
```sql
CREATE TABLE login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT
);
```

### Initial Data

**Access Groups**
- Guest (default for new registrations)
- Member (after email verification)
- VIP Member
- Developer
- Admin (full system access)

**Navigation Items**
Initial setup with these pages:
- Dashboard
- Admin (with sub-items: Users, Access Groups)
- Contact
- Games
- Insights
- Profile
- Results

## Application Structure

### Directory Structure

```
/insights-app
  /app
    /api
      /auth
        /login/route.ts
        /register/route.ts
        /verify/route.ts
        /reset-password/route.ts
      /user
        /profile/route.ts
      /admin
        /users/route.ts
        /access-groups/route.ts
      /dashboard/route.ts
    /components
      /ui
        Button.tsx
        Card.tsx
        Input.tsx
        Table.tsx
        Sidebar.tsx
        UserInfoBox.tsx
        ThemeProvider.tsx
      AuthForm.tsx
      AdminTable.tsx
      NavigationMenu.tsx
    /admin
      /access-groups/page.tsx
      /users/page.tsx
      page.tsx
    /contact
      page.tsx
    /dashboard
      page.tsx
    /games
      page.tsx
    /insights
      page.tsx
    /profile
      page.tsx
    /results
      page.tsx
    layout.tsx
    page.tsx (AuthForm - Home Page)
  /lib
    /db
      schema.ts
      index.ts
    /auth
      jwt.ts
      bcrypt.ts
      middleware.ts
    /email
      resend.ts
      templates.ts
    /utils
      validation.ts
  /styles
    globals.css
  middleware.ts
  next.config.js
  package.json
  tailwind.config.js
  tsconfig.json
  .env.local
```

## Key Components

### AuthForm Component

The main authentication component that serves as the home page. It includes:

1. **Tab Navigation**:
   - Login
   - Register
   - Password Recovery

2. **Login Tab**:
   - Email input
   - Password input
   - Submit button
   - "Forgot password?" link

3. **Register Tab**:
   - Name input
   - Email input
   - Password input
   - Confirm password input
   - Submit button

4. **Password Recovery Tab**:
   - Email input for requesting reset
   - Verification code input (appears after request)
   - New password input (appears after verification)
   - Submit button

### Layout Structure

```
Main Layout
├── UserInfoBox (top-right)
├── Collapsible Sidebar
│   └── Navigation Items (based on access group)
└── Main Content Area
    └── Page-specific content
```

### Admin Interface

The admin page will include:

1. **Users Management**:
   - Table with searching and filtering
   - CRUD operations for user accounts
   - Ability to change user access groups

2. **Access Groups Management**:
   - CRUD operations for access groups
   - Permission assignment for navigation items

## Authentication Implementation

### JWT Implementation

```typescript
// Example JWT implementation
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}
```

### Password Hashing with bcrypt

```typescript
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

## Database Connection

Using the Neon serverless driver:

```typescript
import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql(query, params);
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}
```

## Email System

Using Resend for sending verification codes:

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, code: string) {
  return await resend.emails.send({
    from: 'verification@yourdomain.com',
    to: email,
    subject: 'Verify your email address',
    html: `<p>Your verification code is: <strong>${code}</strong></p>
          <p>This code will expire in 15 minutes.</p>`
  });
}
```

## API Routes Implementation

### Register Endpoint

```typescript
import { hashPassword } from '@/lib/auth/bcrypt';
import { sql } from '@/lib/db';
import { generateVerificationCode } from '@/lib/utils/validation';
import { sendVerificationEmail } from '@/lib/email/resend';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    // Check if user exists
    const existingUser = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    
    if (existingUser.length > 0) {
      return Response.json({ error: 'Email already registered' }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Get Guest access group
    const guestGroup = await sql`
      SELECT id FROM access_groups WHERE name = 'Guest' LIMIT 1
    `;
    
    if (!guestGroup.length) {
      return Response.json({ error: 'System error: Guest access group not found' }, { status: 500 });
    }
    
    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minutes expiration
    
    // Create user
    const user = await sql`
      INSERT INTO users (name, email, password_hash, access_group_id, verification_code, verification_code_expires)
      VALUES (${name}, ${email}, ${hashedPassword}, ${guestGroup[0].id}, ${code}, ${expiresAt.toISOString()})
      RETURNING id, email
    `;
    
    // Send verification email
    await sendVerificationEmail(email, code);
    
    return Response.json({ 
      success: true, 
      message: 'Registration successful. Please check your email for verification code.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
```

## Access Control Implementation

Middleware to protect routes based on access groups:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth/jwt';
import { sql } from './lib/db';

export async function middleware(request: NextRequest) {
  // Check for JWT token
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Check user access for current path
  const path = request.nextUrl.pathname;
  const userId = payload.sub;
  
  try {
    const hasAccess = await sql`
      SELECT COUNT(*) AS has_access
      FROM users u
      JOIN access_groups ag ON u.access_group_id = ag.id
      JOIN access_group_permissions agp ON ag.id = agp.access_group_id
      JOIN navigation_items ni ON agp.navigation_item_id = ni.id
      WHERE u.id = ${userId}
      AND ni.url = ${path}
      AND agp.can_view = true
    `;
    
    if (hasAccess[0].has_access === 0) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('Access control error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/games/:path*',
    '/insights/:path*',
    '/results/:path*',
    '/profile/:path*',
    '/contact/:path*'
  ],
};
```

## Setup Instructions

1. **Create Next.js App**:
```bash
npx create-next-app@latest insights-app --typescript --tailwind --app
```

2. **Install Dependencies**:
```bash
cd insights-app
npm install @neondatabase/serverless jose bcrypt resend
npm install -D @types/bcrypt
```

3. **Configure Environment Variables**:
Create `.env.local` file:
```
DATABASE_URL=postgres://[user]:[password]@[host]/[database]
JWT_SECRET=your-strong-secret-key-here
RESEND_API_KEY=your-resend-api-key
```

4. **Initialize Database**:
Run the SQL schema creation scripts against your Neon PostgreSQL database.

5. **Initial Setup Steps**:
- After deploying, register your own account
- Connect directly to the database to change your access group to "Admin"
- Access the admin interface to create other access groups and assign permissions

## Development and Deployment

1. **Local Development**:
```bash
npm run dev
```

2. **Deploy to Vercel**:
Connect your GitHub repository to Vercel and deploy from there.

3. **Database Migration**:
Consider using a migration tool for database schema changes as the project evolves.

## Next Steps After Initial Implementation

1. Implement the admin interface for managing users and access groups
2. Add additional functionality to each page based on requirements
3. Enhance the UI with more sophisticated components
4. Add analytics and monitoring
5. Implement testing (unit tests, integration tests)

---

This document provides a comprehensive guide for implementing the Insights application with custom authentication using Vercel Postgres (Neon) and a permissions-based access control system. Following this architecture will ensure a secure, maintainable, and scalable application.

// Authentication utilities
// File: /utils/auth.ts

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from './db';

// Create a secure JWT secret from environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Create a session cookie value with JWT encoding
 * @param userId User ID to encode in the session
 * @param token Session token for verification
 * @param expires When the session expires
 * @returns Encoded session cookie value
 */
export async function createSessionCookie(
  userId: string,
  token: string,
  expires: Date
): Promise<string> {
  try {
    // Create a JWT token
    const jwt = await new SignJWT({ 
      userId, 
      sessionToken: token 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expires.getTime() / 1000)
      .sign(JWT_SECRET);
    
    return jwt;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    throw new Error('Failed to create session token');
  }
}

/**
 * Verify a session cookie and extract user information
 * @param request The Next.js request object containing cookies
 * @returns User ID from the session cookie or null if invalid
 */
export async function getSessionUser(request: NextRequest): Promise<string | null> {
  try {
    // Get the session cookie directly from the request
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    // Verify the JWT token
    const { payload } = await jwtVerify(
      sessionCookie.value,
      JWT_SECRET,
      {
        algorithms: ['HS256'],
      }
    );
    
    return payload.userId as string;
  } catch (error) {
    console.error('Session verification error', error);
    return null;
  }
}

/**
 * Verify if a session is valid in the database
 * @param userId User ID from session
 * @param token Session token from session
 * @returns Whether the session is valid
 */
export async function verifySession(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM user_sessions
        WHERE user_id = $1 AND token = $2 AND expires_at > NOW()
      ) AS valid`,
      [userId, token]
    );
    
    return result.rows[0].valid;
  } catch (error) {
    console.error('Session database verification error', error);
    return false;
  }
}

/**
 * Extract session token from JWT
 * @param jwt JWT token string
 * @returns Session token or null if extraction fails
 */
export function extractSessionToken(jwt: string): string | null {
  try {
    // JWT is in format: header.payload.signature
    const payload = jwt.split('.')[1];
    if (!payload) return null;
    
    // Decode the base64 payload
    const decodedPayload = Buffer.from(payload, 'base64').toString();
    const data = JSON.parse(decodedPayload);
    
    return data.sessionToken || null;
  } catch (e) {
    console.error('Error extracting session token:', e);
    return null;
  }
}

// Client-side auth utilities for use in React components

type AuthResponse = {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
};

/**
 * Request a password reset token
 * @param email User's email address
 * @returns Promise with the request result
 */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/reset-password-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to request password reset');
    }

    return data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw error;
  }
}

/**
 * Reset password using token
 * @param token Reset token from email
 * @param newPassword New password to set
 * @returns Promise with the reset result
 */
export async function resetPassword(token: string, newPassword: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/reset-password-confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password: newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

/**
 * Request email verification token
 * @returns Promise with the request result
 */
export async function requestVerification(): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/resend-verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to request email verification');
    }

    return data;
  } catch (error) {
    console.error('Email verification request error:', error);
    throw error;
  }
}

/**
 * Verify email using token
 * @param token Verification token from email
 * @returns Promise with the verification result
 */
export async function verifyEmail(token: string): Promise<AuthResponse> {
  try {
    const response = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify email');
    }

    return data;
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
}

/**
 * Check if user needs to reset password after migration
 * @returns Promise with the check result
 */
export async function checkMigrationStatus(): Promise<{
  needsPasswordReset: boolean;
  needsEmailVerification: boolean;
}> {
  try {
    const response = await fetch('/api/auth/migration-status', {
      method: 'GET',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to check migration status');
    }

    return {
      needsPasswordReset: data.needsPasswordReset || false,
      needsEmailVerification: data.needsEmailVerification || false,
    };
  } catch (error) {
    console.error('Migration status check error:', error);
    // Default to not requiring reset/verification if check fails
    return {
      needsPasswordReset: false,
      needsEmailVerification: false,
    };
  }
}

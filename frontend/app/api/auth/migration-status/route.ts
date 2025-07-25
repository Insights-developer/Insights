import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, extractSessionToken } from '@/utils/auth';
import { query } from '@/utils/db';

/**
 * API endpoint to check if the current user needs post-migration actions
 * like password reset or email verification
 */
export async function GET(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const userId = await getSessionUser(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the session cookie and extract the token
    const sessionCookie = request.cookies.get('session');
    if (!sessionCookie?.value) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }
    
    const sessionToken = extractSessionToken(sessionCookie.value);
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Invalid session token' },
        { status: 401 }
      );
    }
    
    // Check the user's migration status
    const userResult = await query(
      `SELECT 
        CASE 
          WHEN password_hash IS NULL THEN TRUE
          WHEN password_hash = '' THEN TRUE
          WHEN password_hash LIKE 'MIGRATED-%' THEN TRUE
          ELSE FALSE
        END AS needs_password_reset,
        CASE 
          WHEN email_verified IS NULL THEN TRUE
          WHEN email_verified = FALSE THEN TRUE
          ELSE FALSE
        END AS needs_email_verification
      FROM users
      WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const user = userResult.rows[0];
    
    return NextResponse.json({
      success: true,
      needsPasswordReset: user.needs_password_reset,
      needsEmailVerification: user.needs_email_verification
    });
    
  } catch (error: any) {
    console.error('Migration status check error:', error);
    
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    );
  }
}

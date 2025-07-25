// Email verification endpoint
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    // Get token from URL query parameters
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    return await transaction(async (client) => {
      // Check if token exists and is still valid
      const tokenResult = await client.query(
        `SELECT user_id, expires_at 
         FROM verification_tokens 
         WHERE token = $1 AND used = false`,
        [token]
      );
      
      if (tokenResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired verification token' },
          { status: 400 }
        );
      }
      
      const { user_id, expires_at } = tokenResult.rows[0];
      
      // Check if token is expired
      if (new Date(expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Verification token has expired' },
          { status: 400 }
        );
      }
      
      // Update user's verified status
      await client.query(
        'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id = $1',
        [user_id]
      );
      
      // Mark token as used
      await client.query(
        'UPDATE verification_tokens SET used = true WHERE token = $1',
        [token]
      );
      
      // Redirect to login page with success message
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const redirectUrl = `${baseUrl}/login?verified=true`;
      
      return NextResponse.redirect(redirectUrl);
    });
    
  } catch (err) {
    console.error('Email verification error:', err);
    
    // Redirect to error page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/login?error=verification-failed`;
    
    return NextResponse.redirect(redirectUrl);
  }
}

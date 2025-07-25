// Logout endpoint
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, extractSessionToken } from '@/utils/auth';
import { query } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const userId = await getSessionUser(request);
    
    // Get the session cookie
    const sessionCookie = request.cookies.get('session');
    
    if (sessionCookie) {
      // Extract token from JWT
      const sessionToken = extractSessionToken(sessionCookie.value);
      
      if (userId && sessionToken) {
        // Delete the session from the database
        await query(
          'DELETE FROM user_sessions WHERE user_id = $1 AND token = $2',
          [userId, sessionToken]
        );
      }
      
      // Delete the cookie regardless of whether we found a valid session
      const response = NextResponse.json({ success: true });
      response.cookies.set('session', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      return response;
    } else {
      return NextResponse.json({ success: true });
    }
    
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ success: true }); // Still return success even if there was an error
  }
}

// Using extractSessionToken from auth.ts

// Session refresh endpoint
import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie, getSessionUser } from '@/utils/auth';
import { transaction } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const userId = await getSessionUser(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session' },
        { status: 401 }
      );
    }
    
    return await transaction(async (client) => {
      // Generate new session token
      const tokenResult = await client.query('SELECT generate_secure_token() AS token');
      const newSessionToken = tokenResult.rows[0].token;
      
      // Set new expiration (16 hours)
      const newExpires = new Date();
      newExpires.setHours(newExpires.getHours() + 16);
      
      // Create new session record
      await client.query(
        'INSERT INTO user_sessions(user_id, token, expires_at, ip_address, user_agent) VALUES($1, $2, $3, $4, $5)',
        [
          userId,
          newSessionToken,
          newExpires.toISOString(),
          request.headers.get('x-forwarded-for') || 'unknown',
          request.headers.get('user-agent') || 'unknown'
        ]
      );
      
      // Create JWT token and set cookie
      const cookieValue = await createSessionCookie(userId, newSessionToken, newExpires);
      
      // Create response and set cookie
      const response = NextResponse.json({
        sessionExpires: newExpires.toISOString()
      });
      
      // Set the session cookie in the response
      response.cookies.set('session', cookieValue, {
        httpOnly: true,
        expires: newExpires,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      
      // Return the response with cookie
      return response;
    });
    
  } catch (err) {
    console.error('Session refresh error:', err);
    return NextResponse.json(
      { error: 'Session refresh failed' },
      { status: 500 }
    );
  }
}

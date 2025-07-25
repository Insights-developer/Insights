// Custom authentication login endpoint
import { NextRequest, NextResponse } from 'next/server';
import { createSessionCookie } from '@/utils/auth';
import { transaction } from '@/utils/db';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    return await transaction(async (client) => {
      // Get user by email
      const userResult = await client.query(
        'SELECT id, email, password_hash, account_locked FROM users WHERE email = $1',
        [email]
      );
      
      if (userResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      const user = userResult.rows[0];
      
      // Check if account is locked
      if (user.account_locked) {
        return NextResponse.json(
          { error: 'Account is locked. Please contact support.' },
          { status: 403 }
        );
      }
      
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
        
        // Check if we should lock the account (5+ failed attempts)
        const attemptsResult = await client.query(
          'SELECT failed_login_attempts FROM users WHERE id = $1',
          [user.id]
        );
        
        if (attemptsResult.rows[0].failed_login_attempts >= 5) {
          await client.query(
            'UPDATE users SET account_locked = true WHERE id = $1',
            [user.id]
          );
        }
        
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }
      
      // Generate session token
      const tokenResult = await client.query('SELECT generate_secure_token() AS token');
      const sessionToken = tokenResult.rows[0].token;
      
      // Set session expiration (16 hours)
      const expires = new Date();
      expires.setHours(expires.getHours() + 16);
      
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
      
      // Reset failed attempts and update login timestamps
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
      
      const features = featuresResult.rows.map((row: { key: string }) => row.key);
      
      // Create JWT token and set cookie
      const cookieValue = await createSessionCookie(user.id, sessionToken, expires);
      
      // Create response with user data
      const response = NextResponse.json({
        user: { id: user.id, email: user.email },
        features,
        sessionExpires: expires.toISOString()
      });
      
      // Set the session cookie in the response
      response.cookies.set('session', cookieValue, {
        httpOnly: true,
        expires,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      
      // Return the response with cookie
      return response;
    });
    
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

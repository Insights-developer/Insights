// /frontend/app/api/auth/bypass-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

// Create a secure JWT secret from environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

// This route completely bypasses Supabase and creates a manual session
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
    
    // Create a manual user object
    const user = {
      id: 'dev-' + Math.random().toString(36).substring(2, 15),
      email: email,
      name: email.split('@')[0],
      role: 'admin',
      created_at: new Date().toISOString(),
    };
    
    // Create a session token
    const token = await new SignJWT({ 
      sub: user.id,
      email: user.email,
      role: user.role
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);
    
    // Set cookie
    const response = NextResponse.json({ 
      success: true, 
      user: user,
      message: 'Development bypass login successful'
    });
    
    // Set the session cookie
    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
    
    // Set a client-accessible cookie for the UI
    response.cookies.set('user_email', user.email, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });
    
    return response;
  } catch (err) {
    console.error('Unexpected bypass login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

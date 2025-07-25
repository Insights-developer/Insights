import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Create a secure JWT secret from environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

/**
 * Middleware to protect certain routes and handle authentication
 */
export async function middleware(req: NextRequest) {
  // Initialize response
  const res = NextResponse.next();
  
  // Skip auth for public API routes
  if (
    req.nextUrl.pathname.startsWith('/api/auth/login') ||
    req.nextUrl.pathname.startsWith('/api/auth/direct-login') ||
    req.nextUrl.pathname.startsWith('/api/auth/bypass-login') ||
    req.nextUrl.pathname.startsWith('/api/auth/register') ||
    req.nextUrl.pathname.startsWith('/api/auth/reset-password') ||
    req.nextUrl.pathname.startsWith('/api/auth/verify-email') ||
    req.nextUrl.pathname.startsWith('/api/debug/config')
  ) {
    return res;
  }
  
  try {
    // Get the session cookie
    const sessionCookie = req.cookies.get('session');
    
    if (!sessionCookie?.value) {
      // For API routes, return 401
      if (req.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        );
      }
      
      // For protected pages, redirect to login
      const redirectUrl = new URL('/login', req.url);
      redirectUrl.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Verify the JWT token
    await jwtVerify(
      sessionCookie.value,
      JWT_SECRET,
      {
        algorithms: ['HS256'],
      }
    );
    
    // If verification passes, continue
    return res;
    
  } catch (error) {
    console.error('Authentication middleware error:', error);
    
    // Delete the invalid cookie
    res.cookies.set('session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    
    // For API routes, return 401
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid session' },
        { status: 401 }
      );
    }
    
    // For protected pages, redirect to login
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure which routes require authentication
// Exclude authentication endpoints and public routes
export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
};

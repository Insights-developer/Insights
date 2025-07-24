import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Initialize Supabase with middleware client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession();

  // Admin routes require authentication
  if (req.nextUrl.pathname.startsWith('/api/admin') && !session) {
    console.log('Unauthorized access attempt to admin API:', req.nextUrl.pathname);
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Continue with the request
  return res;
}

// Only run middleware on API routes
export const config = {
  matcher: ['/api/admin/:path*'],
};

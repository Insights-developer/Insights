import { NextRequest, NextResponse } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  // Initialize response that we'll pass into the supabase client
  const res = NextResponse.next();
  
  try {
    // Initialize Supabase with middleware client
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if possible
    await supabase.auth.getSession();
    
    // IMPORTANT: We no longer block requests here, individual API routes
    // will handle their own auth requirements. This prevents issues with
    // session cookie handling and timing problems.
    
    // Return the modified response
    return res;
  } catch (err) {
    console.error('Middleware error:', err);
    // Continue anyway and let the API routes handle auth
    return res;
  }
}

// Only run middleware on API routes
export const config = {
  matcher: ['/api/admin/:path*'],
};

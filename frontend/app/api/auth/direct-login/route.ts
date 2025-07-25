// /frontend/app/api/auth/direct-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createBrowserClient } from '@supabase/ssr';

// Bypass server client since it might be using middleware
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// Enforce no authentication check for this route
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  // Create a direct browser client without server-side checks
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: 'Supabase configuration missing' },
      { status: 500 }
    );
  }

  const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
  
  try {
    const { email, password } = await request.json();
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Try to sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login error:', error);
      
      // If it's a new installation, try to create a test user
      if (error.message.includes('Invalid login credentials')) {
        // Attempt to create a user
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: 'Test User',
            },
          },
        });
        
        if (signupError) {
          return NextResponse.json(
            { 
              error: 'Authentication failed and could not create test user',
              details: signupError.message
            },
            { status: 401 }
          );
        }
        
        // If we created a new user, try to log in again or return the session
        if (signupData?.session) {
          return NextResponse.json({ 
            success: true, 
            message: 'Created and logged in new test user',
            user: signupData.user 
          });
        } else {
          // Try login one more time
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (retryError) {
            return NextResponse.json(
              { 
                error: 'Created user but could not log in automatically',
                details: retryError.message
              },
              { status: 401 }
            );
          }
          
          return NextResponse.json({ 
            success: true, 
            message: 'Created new test user and logged in successfully',
            user: retryData.user 
          });
        }
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      user: data.user 
    });
  } catch (err) {
    console.error('Unexpected login error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

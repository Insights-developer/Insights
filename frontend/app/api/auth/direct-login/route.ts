// /frontend/app/api/auth/direct-login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  
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

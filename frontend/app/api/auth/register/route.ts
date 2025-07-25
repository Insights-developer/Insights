// Custom authentication registration endpoint
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { transaction } from '@/utils/db';

// Mock email function - replace with your actual email service
async function sendVerificationEmail(email: string, token: string) {
  console.log(`[MOCK] Sending verification email to ${email} with token ${token}`);
  // In production, integrate with your email service
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();
    
    // Server-side validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Password strength check
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }
    
    return await transaction(async (client) => {
      // Check if email already exists
      const existingUserResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUserResult.rowCount > 0) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      
      // Create user with secure UUID
      const userId = uuidv4();
      
      // Generate verification token
      const tokenResult = await client.query('SELECT generate_secure_token() AS token');
      const verificationToken = tokenResult.rows[0].token;
      
      // Set expiration time (24 hours from now)
      const expires = new Date();
      expires.setHours(expires.getHours() + 24);
      
      // Hash password
      const passwordHashResult = await client.query(
        'SELECT hash_password($1) AS hash',
        [password]
      );
      const passwordHash = passwordHashResult.rows[0].hash;
      
      // Insert new user
      await client.query(
        'INSERT INTO users(id, email, password_hash, created_at, username) VALUES($1, $2, $3, $4, $5)',
        [userId, email, passwordHash, new Date().toISOString(), name || null]
      );
      
      // Create verification token
      await client.query(
        'INSERT INTO email_verification(user_id, token, expires_at) VALUES($1, $2, $3)',
        [userId, verificationToken, expires.toISOString()]
      );
      
      // Update user record with token
      await client.query(
        'UPDATE users SET email_verification_token = $1, email_verification_expires = $2 WHERE id = $3',
        [verificationToken, expires.toISOString(), userId]
      );
      
      // Send verification email
      await sendVerificationEmail(email, verificationToken);
      
      return NextResponse.json(
        { 
          message: 'Registration successful. Please verify your email.',
          userId
        },
        { status: 201 }
      );
    });
    
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

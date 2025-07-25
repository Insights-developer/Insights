// Resend email verification endpoint
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/utils/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    // Check if user exists and needs verification
    const userResult = await query(
      'SELECT id, email_verified FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (userResult.rowCount === 0) {
      // Don't reveal whether user exists
      return NextResponse.json({ 
        success: true, 
        message: 'If your email exists in our system, you will receive verification instructions shortly' 
      });
    }
    
    const { id: userId, email_verified } = userResult.rows[0];
    
    // If already verified, let them know
    if (email_verified) {
      return NextResponse.json({ 
        success: true,
        message: 'Your email is already verified. You can log in now.' 
      });
    }
    
    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store verification token in database
    await query(
      'INSERT INTO verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, verificationToken, expiresAt]
    );
    
    // Construct verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${verificationToken}`;
    
    // In a production environment, you would send an email here
    // For development, just log the URL
    console.log('Email verification URL:', verificationUrl);
    
    // TODO: Implement actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Verify Your Email Address',
    //   text: `Click the following link to verify your email address: ${verificationUrl}`,
    //   html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`
    // });
    
    return NextResponse.json({ 
      success: true,
      message: 'If your email exists in our system, you will receive verification instructions shortly' 
    });
    
  } catch (err) {
    console.error('Email verification resend error:', err);
    return NextResponse.json(
      { error: 'Email verification request failed' },
      { status: 500 }
    );
  }
}

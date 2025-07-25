// Password reset request endpoint
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
    
    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    
    if (userResult.rowCount === 0) {
      // Don't reveal whether user exists - return success even if email not found
      return NextResponse.json({ 
        success: true, 
        message: 'If your email exists in our system, you will receive reset instructions shortly' 
      });
    }
    
    const userId = userResult.rows[0].id;
    
    // Generate a reset token (secure random string)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiration (1 hour from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    // Store reset token in database
    await query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [userId, resetToken, expiresAt]
    );
    
    // Construct reset URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;
    
    // In a production environment, you would send an email here
    // For development, just log the URL
    console.log('Password reset URL:', resetUrl);
    
    // TODO: Implement actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Password Reset Request',
    //   text: `Click the following link to reset your password: ${resetUrl}`,
    //   html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p>`
    // });
    
    return NextResponse.json({ 
      success: true,
      message: 'If your email exists in our system, you will receive reset instructions shortly' 
    });
    
  } catch (err) {
    console.error('Password reset request error:', err);
    return NextResponse.json(
      { error: 'Password reset request failed' },
      { status: 500 }
    );
  }
}

// Password reset confirmation endpoint
import { NextRequest, NextResponse } from 'next/server';
import { query, transaction } from '@/utils/db';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and new password are required' },
        { status: 400 }
      );
    }
    
    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    return await transaction(async (client) => {
      // Check if token exists and is still valid
      const tokenResult = await client.query(
        `SELECT user_id, expires_at 
         FROM password_reset_tokens 
         WHERE token = $1 AND used = false`,
        [token]
      );
      
      if (tokenResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        );
      }
      
      const { user_id, expires_at } = tokenResult.rows[0];
      
      // Check if token is expired
      if (new Date(expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Reset token has expired' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update user's password
      await client.query(
        'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
        [hashedPassword, user_id]
      );
      
      // Mark token as used
      await client.query(
        'UPDATE password_reset_tokens SET used = true WHERE token = $1',
        [token]
      );
      
      // Invalidate all existing sessions for the user
      await client.query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [user_id]
      );
      
      return NextResponse.json({
        success: true,
        message: 'Password has been reset successfully'
      });
    });
    
  } catch (err) {
    console.error('Password reset error:', err);
    return NextResponse.json(
      { error: 'Password reset failed' },
      { status: 500 }
    );
  }
}

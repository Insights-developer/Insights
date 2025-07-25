'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Card from '@/app/components/ui/Cards';
import Button from '@/app/components/ui/Buttons';
import Icon from '@/app/components/ui/Icon';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Please request a new password reset link.');
    }
  }, [token]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset states
    setError(null);
    setMessage(null);
    
    // Validate inputs
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!token) {
      setError('Missing reset token');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/reset-password-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
      } else {
        setSuccess(true);
        setMessage(data.message || 'Password has been reset successfully');
        // Clear form
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <Icon name="lock" className="mb-2" animate style={{ fontSize: 32, color: '#4953fe' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Reset Your Password</h1>
        <span style={{ fontSize: 14, color: '#737a99', margin: '4px 0 8px 0' }}>
          Enter your new password below
        </span>
      </div>
      
      {error && (
        <div style={{ 
          marginBottom: 16,
          padding: '10px 14px',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          borderRadius: 8,
          color: '#dc3545',
          fontSize: 14 
        }}>
          {error}
        </div>
      )}
      
      {message && (
        <div style={{ 
          marginBottom: 16,
          padding: '10px 14px',
          backgroundColor: success ? 'rgba(40, 167, 69, 0.1)' : 'rgba(0, 123, 255, 0.1)',
          borderRadius: 8,
          color: success ? '#28a745' : '#007bff',
          fontSize: 14 
        }}>
          {message}
          {success && (
            <div style={{ marginTop: 8 }}>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => router.push('/login')}
              >
                Return to Login
              </Button>
            </div>
          )}
        </div>
      )}
      
      {!success && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <label style={{ display: 'block', marginBottom: 0, fontWeight: 500 }}>
            <span style={{ fontSize: 14, color:'#737a99', marginBottom: 4, display:"inline-block" }}>New Password</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f6f7fb',
              border: '1px solid #E5E9F6',
              borderRadius: 8,
              padding: '0 8px',
              height: 40,
              marginTop: 2
            }}>
              <span style={{ marginRight: 6, color: "#b7bddc" }}><Icon name="lock" /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: '#222',
                }}
                placeholder="Enter your new password"
                required
                minLength={8}
              />
              <button
                type="button"
                tabIndex={-1}
                style={{
                  background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer',
                  color: '#888'
                }}
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <Icon name={showPassword ? 'eye-off' : 'eye'} />
              </button>
            </div>
          </label>
          
          <label style={{ display: 'block', marginBottom: 0, fontWeight: 500 }}>
            <span style={{ fontSize: 14, color:'#737a99', marginBottom: 4, display:"inline-block" }}>Confirm Password</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f6f7fb',
              border: '1px solid #E5E9F6',
              borderRadius: 8,
              padding: '0 8px',
              height: 40,
              marginTop: 2
            }}>
              <span style={{ marginRight: 6, color: "#b7bddc" }}><Icon name="lock" /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  fontSize: 15,
                  color: '#222',
                }}
                placeholder="Confirm your new password"
                required
              />
            </div>
          </label>
          
          <Button 
            variant="primary" 
            fullWidth 
            type="submit" 
            disabled={loading || !token}
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
          
          <Button 
            variant="secondary" 
            size="sm" 
            fullWidth 
            type="button" 
            onClick={() => router.push('/login')}
          >
            Back to Login
          </Button>
        </form>
      )}
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/browser';

export default function ResendConfirmation() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://insights-orpin-xi.vercel.app/auth/callback' // Update this as needed
      }
    });
    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <main style={{ maxWidth: 420, margin: '3rem auto', padding: 20 }}>
      <h2>Resend Confirmation Email</h2>
      <form onSubmit={handleResend}>
        <input
          type="email"
          required
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ marginBottom: 10, width: '100%' }}
        />
        <button type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending...' : 'Resend Email'}
        </button>
        {status === 'sent' && (
          <div style={{ color: 'green', marginTop: 8 }}>
            Confirmation email resent! Check your inbox.
          </div>
        )}
        {status === 'error' && error && (
          <div style={{ color: 'red', marginTop: 8 }}>{error}</div>
        )}
      </form>
      <div style={{ marginTop: 16 }}>
        <a href="/auth">Back to login</a>
      </div>
    </main>
  );
}

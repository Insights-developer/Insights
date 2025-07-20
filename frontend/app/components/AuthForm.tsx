'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/browser';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authResult;
    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      authResult = { error };
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://insights-orpin-xi.vercel.app/auth/callback'
        }
      });
      authResult = { error };
    }

    if (authResult.error) {
      setError(authResult.error.message || 'Authentication error');
    } else {
      // Successful login or sign up (if auto-confirmed)
      router.push('/dashboard');
    }
    setLoading(false);
  }

  const isUnconfirmed =
    error?.toLowerCase().includes('confirm') ||
    error?.toLowerCase().includes('email not confirmed');

  return (
    <div>
      <h2>{mode === 'sign-in' ? 'Sign In' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            autoComplete="username"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{ width: '100%', marginBottom: 12 }}
          />
        </div>
        <div>
          <input
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
            style={{ width: '100%', marginBottom: 12 }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Processing…' : mode === 'sign-in' ? 'Sign In' : 'Sign Up'}
        </button>
        {error && (
          <div style={{ color: 'red', marginTop: 8 }}>
            {error}
            {isUnconfirmed && (
              <div style={{ marginTop: 8 }}>
                Didn&apos;t get a confirmation email?{' '}
                <Link href="/auth/resend-confirmation">Resend confirmation</Link>
              </div>
            )}
          </div>
        )}
      </form>
      <button
        type="button"
        onClick={() => { setError(null); setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in'); }}
        style={{ marginTop: 16, width: '100%' }}
      >
        {mode === 'sign-in'
          ? "Need an account? Sign Up"
          : "Already have an account? Sign In"}
      </button>
    </div>
  );
}

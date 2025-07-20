'use client';

import { useState } from 'react';
import { supabase } from '@/utils/supabase/browser';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
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

    const action = mode === 'sign-in'
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password });

    const { error } = await action;
    if (error) setError(error.message);
    else router.push('/');
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 320, margin: '3rem auto', padding: 20, border: '1px solid #eee' }}>
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
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
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
    </main>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Buttons';

type Tab = 'login' | 'register' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [pwShow, setPwShow] = useState(false);

  const [registerName, setRegisterName] = useState('');
  const [registerPw2, setRegisterPw2] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Async and error states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);

  // ---- Tab Panel Renderers ----

  function renderLogin() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          setMessage(null);
          setShowVerifyNotice(false);
          const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
          if (error) {
            if (error.message.toLowerCase().includes('email not confirmed')) {
              setShowVerifyNotice(true);
              setMessage(null);
            } else setError(error.message);
          } else {
            router.replace('/dashboard');
          }
          setLoading(false);
        }}
        className="space-y-4"
      >
        <FieldEmail value={email} onChange={setEmail} disabled={loading} />
        <FieldPassword value={pw} onChange={setPw} show={pwShow} setShow={setPwShow} disabled={loading} />
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
        <div className="flex justify-between text-sm mt-1">
          <button type="button" className="text-primary hover:underline" onClick={() => setTab('register')}>
            Register
          </button>
          <button type="button" className="text-primary hover:underline" onClick={() => setTab('forgot')}>
            Forgot password?
          </button>
        </div>
      </form>
    );
  }

  function renderRegister() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          setMessage(null);
          if (!registerName.trim()) {
            setError('Enter your name.');
            setLoading(false);
            return;
          }
          if (pw !== registerPw2) {
            setError('Passwords must match.');
            setLoading(false);
            return;
          }
          const { data, error } = await supabase.auth.signUp({
            email,
            password: pw,
            options: {
              data: { name: registerName },
            },
          });
          if (error) setError(error.message);
          else if (data.user && !data.user.confirmed_at) {
            setMessage('Signup successful! Check your email to verify and sign in.');
            setTab('login');
          } else {
            setMessage('Signup successful—welcome!');
            router.replace('/dashboard');
          }
          setLoading(false);
        }}
        className="space-y-4"
      >
        <FieldText label="Name" value={registerName} onChange={setRegisterName} disabled={loading} />
        <FieldEmail value={email} onChange={setEmail} disabled={loading} />
        <FieldPassword value={pw} onChange={setPw} show={pwShow} setShow={setPwShow} disabled={loading} />
        <FieldPassword label="Confirm Password" value={registerPw2} onChange={setRegisterPw2} show={pwShow} setShow={() => {}} disabled={loading} />
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </Button>
        <button type="button" className="text-primary underline text-sm w-full mt-2" onClick={() => setTab('login')}>
          Back to Login
        </button>
      </form>
    );
  }

  function renderForgot() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setError(null);
          setMessage(null);
          setResetEmailSent(false);
          const { error } = await supabase.auth.resetPasswordForEmail(verifyEmail || email);
          setLoading(false);
          if (error) setError('We could not send the reset email. ' + error.message);
          else {
            setResetEmailSent(true);
            setMessage('If this email is in our system, a password reset link has been sent.');
          }
        }}
        className="space-y-4"
      >
        <FieldEmail
        value={verifyEmail || email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerifyEmail(e.target.value)}
        disabled={loading}
        />
        <Button type="submit" variant="primary" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
        <button type="button" className="text-primary underline text-sm w-full mt-2" onClick={() => setTab('login')}>
          Back to Login
        </button>
      </form>
    );
  }

  // ---- Main Page Layout ----

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col">
        <div className="flex flex-col items-center mb-6">
          <Icon name="lock" className="mb-2 text-3xl text-primary" />
          <h1 className="text-2xl font-bold mb-1">Welcome to Lottery Analytics</h1>
          <span className="text-sm text-gray-500 mb-2">Login, Register, or Recover Access</span>
        </div>

        <div className="flex border-b mb-6">
          <TabBtn active={tab === 'login'} onClick={() => setTab('login')}>
            Login
          </TabBtn>
          <TabBtn active={tab === 'register'} onClick={() => setTab('register')}>
            Register
          </TabBtn>
          <TabBtn active={tab === 'forgot'} onClick={() => setTab('forgot')}>
            Forgot Password
          </TabBtn>
        </div>

        {error && <div className="bg-red-100 border border-red-200 text-red-700 rounded px-3 py-2 mb-3 text-sm">{error}</div>}
        {message && <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded px-3 py-2 mb-3 text-sm">{message}</div>}

        {showVerifyNotice && (
          <div className="bg-yellow-50 border border-yellow-100 text-yellow-700 rounded px-3 py-2 mb-3 text-sm">
            Please check your inbox to verify your email.
            <br />
            <button
              type="button"
              onClick={async () => {
                setLoading(true);
                const { error } = await supabase.auth.resend({ type: 'signup', email });
                setLoading(false);
                if (error) setError('Failed to resend verification email.');
                else setMessage('Verification email resent! Please check your inbox.');
                setShowVerifyNotice(false);
              }}
              className="text-primary underline text-sm ml-1"
            >
              Resend verification
            </button>
          </div>
        )}

        {tab === 'login' && renderLogin()}
        {tab === 'register' && renderRegister()}
        {tab === 'forgot' && renderForgot()}
      </div>
    </main>
  );
}

// ---- Small UI Helpers ----

function TabBtn({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className={`flex-1 py-2 font-semibold border-b-2 transition-colors ${
        active ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-primary'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function FieldEmail({ value, onChange, disabled }: { value: string; onChange: any; disabled?: boolean }) {
  return (
    <div>
      <label htmlFor="email" className="block text-sm font-medium text-gray-600">
        Email
      </label>
      <div className="relative mt-1">
        <input
          id="email"
          type="email"
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="your@email.com"
          value={value}
          autoComplete="email"
          onChange={(e) => (typeof onChange === 'function' ? onChange(e.target.value) : null)}
          required
          disabled={disabled}
        />
        <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
          <Icon name="mail" />
        </span>
      </div>
    </div>
  );
}

function FieldPassword({
  label = 'Password',
  value,
  onChange,
  show,
  setShow,
  disabled,
}: {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  show: boolean;
  setShow: (show: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <div className="relative mt-1">
        <input
          type={show ? 'text' : 'password'}
          className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={label}
          autoComplete={label?.toLowerCase().includes('confirm') ? 'new-password' : 'current-password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          disabled={disabled}
        />
        <span className="absolute left-3 top-2.5 text-gray-400 pointer-events-none">
          <Icon name="lock" />
        </span>
        {setShow && (
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShow(!show)}
            tabIndex={-1}
          >
            <Icon name={show ? 'eye-off' : 'eye'} />
          </button>
        )}
      </div>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <input
        type="text"
        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        disabled={disabled}
      />
    </div>
  );
}

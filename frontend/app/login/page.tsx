'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Button from '../components/ui/Buttons';
import Icon from '../components/ui/Icon';
import Card from '../components/ui/Cards';

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

  // --- RENDERERS ---

  function renderLogin() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          setError(null); setMessage(null); setShowVerifyNotice(false);
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
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        spellCheck={false}
      >
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          icon={<Icon name="mail" />}
          disabled={loading}
        />
        <Field
          label="Password"
          type={pwShow ? 'text' : 'password'}
          autoComplete="current-password"
          value={pw}
          onChange={setPw}
          icon={<Icon name="lock" />}
          disabled={loading}
          action={
            <button
              type="button"
              tabIndex={-1}
              style={{
                background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer',
                color: '#888'
              }}
              onClick={() => setPwShow(s => !s)}
              aria-label={pwShow ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              <Icon name={pwShow ? 'eye-off' : 'eye'} />
            </button>
          }
        />
        <Button variant="primary" fullWidth type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 4 }}>
          <Button variant="secondary" size="sm" type="button" onClick={() => setTab('register')} disabled={loading}>
            Register
          </Button>
          <Button variant="secondary" size="sm" type="button" onClick={() => setTab('forgot')} disabled={loading}>
            Forgot password?
          </Button>
        </div>
      </form>
    );
  }

  function renderRegister() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true); setError(null); setMessage(null);
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
            options: { data: { name: registerName } },
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
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        spellCheck={false}
      >
        <Field
          label="Name"
          type="text"
          value={registerName}
          onChange={setRegisterName}
          icon={<Icon name="user" />}
          autoComplete="name"
          disabled={loading}
        />
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          icon={<Icon name="mail" />}
          autoComplete="email"
          disabled={loading}
        />
        <Field
          label="Password"
          type={pwShow ? 'text' : 'password'}
          value={pw}
          onChange={setPw}
          icon={<Icon name="lock" />}
          autoComplete="new-password"
          disabled={loading}
          action={
            <button
              type="button"
              tabIndex={-1}
              style={{
                background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer',
                color: '#888'
              }}
              onClick={() => setPwShow(s => !s)}
              aria-label={pwShow ? 'Hide password' : 'Show password'}
              disabled={loading}
            >
              <Icon name={pwShow ? 'eye-off' : 'eye'} />
            </button>
          }
        />
        <Field
          label="Confirm Password"
          type={pwShow ? 'text' : 'password'}
          value={registerPw2}
          onChange={setRegisterPw2}
          icon={<Icon name="lock" />}
          autoComplete="new-password"
          disabled={loading}
        />
        <Button variant="primary" fullWidth type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </Button>
        <Button variant="secondary" size="sm" fullWidth type="button" onClick={() => setTab('login')} disabled={loading}>
          Back to Login
        </Button>
      </form>
    );
  }

  function renderForgot() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          setLoading(true); setError(null); setMessage(null); setResetEmailSent(false);
          const { error } = await supabase.auth.resetPasswordForEmail(verifyEmail || email);
          setLoading(false);
          if (error) setError('We could not send the reset email. ' + error.message);
          else {
            setResetEmailSent(true);
            setMessage('If this email is in our system, a password reset link has been sent.');
          }
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        spellCheck={false}
      >
        <Field
          label="Email"
          type="email"
          value={verifyEmail || email}
          onChange={setVerifyEmail}
          icon={<Icon name="mail" />}
          autoComplete="email"
          disabled={loading}
        />
        <Button variant="primary" fullWidth type="submit" disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Button>
        <Button variant="secondary" size="sm" fullWidth type="button" onClick={() => setTab('login')} disabled={loading}>
          Back to Login
        </Button>
      </form>
    );
  }

  // --- MAIN ---
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#f6f7fb 0%,#fff 80%,#f3f4fa 100%)',
      }}
    >
      <Card className="max-w-md w-full">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
          <Icon name="lock" className="mb-2" animate style={{ fontSize: 32, color: '#4953fe' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Welcome to Lottery Analytics</h1>
          <span style={{ fontSize: 14, color: '#737a99', margin: '4px 0 8px 0' }}>
            Login, Register, or Recover Access
          </span>
        </div>

        <Tabs value={tab} onChange={setTab}>
          <Tabs.Tab value="login">Login</Tabs.Tab>
          <Tabs.Tab value="register">Register</Tabs.Tab>
          <Tabs.Tab value="forgot">Forgot Password</Tabs.Tab>
        </Tabs>

        {error && (
          <SystemNotice type="error">{error}</SystemNotice>
        )}
        {message && (
          <SystemNotice type={resetEmailSent ? "info" : "success"}>{message}</SystemNotice>
        )}
        {showVerifyNotice && (
          <SystemNotice type="warning">
            <>
              Please check your inbox to verify your email.
              <br />
              <Button
                size="sm"
                variant="outline"
                style={{ marginLeft: 4 }}
                onClick={async () => {
                  setLoading(true);
                  const { error } = await supabase.auth.resend({ type: 'signup', email });
                  setLoading(false);
                  if (error) setError('Failed to resend verification email.');
                  else setMessage('Verification email resent! Please check your inbox.');
                  setShowVerifyNotice(false);
                }}
                disabled={loading}
              >
                Resend verification
              </Button>
            </>
          </SystemNotice>
        )}

        {tab === 'login' && renderLogin()}
        {tab === 'register' && renderRegister()}
        {tab === 'forgot' && renderForgot()}
      </Card>
    </main>
  );
}

// ---- Design System Subcomponents ----

function Tabs({
  value,
  onChange,
  children,
}: {
  value: Tab;
  onChange: (tab: Tab) => void;
  children: React.ReactNode;
}) {
  return (
    <nav style={{ display: 'flex', borderBottom: '1px solid #e5e9f6', marginBottom: 16 }}>
      {
        React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
  return React.cloneElement(child as React.ReactElement<any>, {
    active: (child.props as any).value === value,
    onClick: () => onChange((child.props as any).value),
  });
}
          return child;
        })
      }
    </nav>
  );
}
Tabs.Tab = function TabBtn({
  value,
  active,
  onClick,
  children,
}: {
  value: Tab;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      tabIndex={0}
      style={{
        flex: 1,
        padding: '8px 0',
        fontWeight: 600,
        border: 'none',
        borderBottom: active ? '3px solid #4953fe' : '3px solid transparent',
        background: 'none',
        color: active ? '#4953fe' : '#b7bddc',
        fontSize: 16,
        cursor: 'pointer',
        transition: 'color 0.15s, border-bottom-color 0.15s'
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

function SystemNotice({
  type,
  children,
}: {
  type: 'error' | 'success' | 'warning' | 'info';
  children: React.ReactNode;
}) {
  const style: Record<typeof type, React.CSSProperties> = {
    error:  { background:'#ffe6e6', border:'1px solid #ffbdbd', color:'#ca1d1d' },
    success:{ background:'#e8fbdc', border:'1px solid #b7eecf', color:'#146e37' },
    warning:{ background:'#fff6db', border:'1px solid #ffe8b7', color:'#9b7500' },
    info:   { background:'#e5eafc', border:'1px solid #bddcff', color:'#2341d1' },
  };
  return (
    <div
      style={{
        ...style[type], borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontSize: 14, display:'flex', alignItems:'center'
      }}
      role={type === 'error' ? 'alert' : undefined}
    >
      {children}
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  icon,
  autoComplete,
  disabled,
  action,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  icon?: React.ReactNode;
  autoComplete?: string;
  disabled?: boolean;
  action?: React.ReactNode; // e.g. eye toggler button
}) {
  return (
    <label style={{ display: 'block', marginBottom: 0, fontWeight: 500 }}>
      <span style={{ fontSize: 14, color:'#737a99', marginBottom: 4, display:"inline-block" }}>{label}</span>
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
        <span style={{ marginRight: 6, color: "#b7bddc" }}>{icon}</span>
        <input
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          required
          disabled={disabled}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 15,
            color: '#222',
          }}
          placeholder={label}
        />
        {action && <span>{action}</span>}
      </div>
    </label>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/browser';
import Button from './ui/Buttons';
import Icon from './ui/Icon';
import Card from './ui/Cards';

type Tab = 'login' | 'register' | 'forgot';

export default function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('login');
  
  // Check Supabase configuration on component load
  React.useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        const configResponse = await fetch('/api/debug/config');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          console.log('Supabase Configuration:', configData);
          
          if (!configData.supabaseUrl || !configData.hasAnonKey) {
            setError('Error: Supabase is not properly configured');
          }
        }
      } catch (err) {
        console.error('Failed to check Supabase configuration:', err);
      }
    };
    
    checkSupabaseConfig();
  }, []);

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
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showVerifyNotice, setShowVerifyNotice] = useState(false);

  // --- RENDERERS ---

  function renderLogin() {
    return (
      <form
        onSubmit={async e => {
          e.preventDefault();
          
          // Basic validation
          if (!email || !email.trim()) {
            setError('Email is required');
            return;
          }
          
          if (!pw || pw.length < 6) {
            setError('Password must be at least 6 characters');
            return;
          }
          
          setLoading(true);
          setError(null); setMessage(null); setShowVerifyNotice(false);
          
          try {
            // Use our development bypass login endpoint (completely skips Supabase)
            console.log('Attempting bypass login with:', email);
            setDebugInfo({
              type: 'login_attempt',
              timestamp: Date.now(),
              message: `Bypass login attempt for ${email}`
            });
            
            const response = await fetch('/api/auth/bypass-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
              },
              body: JSON.stringify({ 
                email: email.trim(), 
                password: pw 
              }),
              credentials: 'include'
            });
            
            let result;
            try {
              result = await response.json();
              console.log('Login response:', response.status, result);
            } catch (parseError) {
              console.error('Error parsing response:', parseError);
              throw new Error(`Server returned ${response.status} with invalid JSON`);
            }
            
            if (!response.ok) {
              console.error('Auth error:', result.error, result.details || '');
              setError(result.error || 'Authentication failed');
              
              // Set debug info for developer insights
              setDebugInfo({
                type: 'auth_error',
                error: { message: result.error, details: result.details },
                timestamp: Date.now(),
                message: 'Authentication failed'
              });
            } else if (result.success) {
              // Successfully logged in with bypass
              console.log('Login success:', result);
              setMessage(result.message || 'Login successful');
              
              // Set debug info
              setDebugInfo({
                type: 'auth_success',
                timestamp: Date.now(),
                message: result.message || 'Bypass login successful',
                userId: result.user?.id
              });
              
              // Force reload to pick up the new cookies
              setTimeout(() => {
                // First try to navigate
                router.replace('/dashboard');
                
                // As a fallback, force a reload after a short delay
                setTimeout(() => {
                  window.location.href = '/dashboard';
                }, 500);
              }, 1000);
            }
          } catch (unexpectedError) {
            console.error('Login error:', unexpectedError);
            setError('An unexpected error occurred. Please try again.');
          } finally {
            setLoading(false);
          }
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
        
        {error && (
          <div style={{ 
            marginTop: 8,
            padding: '8px 12px',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderRadius: 4,
            color: '#dc3545',
            fontSize: 14 
          }}>
            {error}
            {error.includes('Invalid login credentials') && (
              <div style={{ marginTop: 4, fontWeight: 'normal' }}>
                Check that your email and password are correct
              </div>
            )}
          </div>
        )}
        
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
            // Update login timestamps for new user
            try {
              await fetch('/api/user/update-login', { method: 'POST' });
            } catch (loginError) {
              console.error('Failed to update login timestamp:', loginError);
              // Don't block signup flow if this fails
            }
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
          
          try {
            // Use our custom password reset request API
            const response = await fetch('/api/auth/reset-password-request', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: verifyEmail || email })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
              setError('We could not send the reset email. ' + (data.error || 'Please try again.'));
            } else {
              setResetEmailSent(true);
              setMessage(data.message || 'If this email is in our system, a password reset link has been sent.');
              // Clear the email field for security
              setVerifyEmail('');
            }
          } catch (error) {
            console.error('Password reset error:', error);
            setError('An unexpected error occurred. Please try again.');
          } finally {
            setLoading(false);
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
    <Card>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <Icon name="lock" className="mb-2" animate style={{ fontSize: 32, color: '#4953fe' }} />
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Welcome to Insights App</h1>
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

      {/* Debug Info Panel Component */}
      {debugInfo && process.env.NODE_ENV !== 'production' && (
        <div style={{
          margin: '12px 0',
          padding: '12px',
          border: '1px solid #ddd',
          borderLeft: `4px solid ${
            debugInfo.type === 'custom_auth_success' || debugInfo.type === 'supabase_auth_success' ? '#0a0' :
            debugInfo.type === 'db_connection_error' || debugInfo.type === 'password_verify_error' ? '#c00' :
            debugInfo.type === 'supabase_auth_error' ? '#f90' :
            debugInfo.type === 'supabase_exception' || debugInfo.type === 'critical_error' ? '#f00' : '#666'
          }`,
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Debug Information:
            <span style={{ 
              color: 'white', 
              backgroundColor: debugInfo.type === 'custom_auth_success' || debugInfo.type === 'supabase_auth_success' ? '#0a0' :
                debugInfo.type === 'db_connection_error' || debugInfo.type === 'password_verify_error' ? '#c00' :
                debugInfo.type === 'supabase_auth_error' ? '#f90' :
                debugInfo.type === 'supabase_exception' || debugInfo.type === 'critical_error' ? '#f00' : '#666',
              padding: '2px 6px', 
              borderRadius: '4px',
              fontSize: '12px',
              marginLeft: '8px'
            }}>
              {debugInfo.type.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {debugInfo.error && (
              <>
                <div>Error: {debugInfo.error.message || 'Unknown error'}</div>
                {debugInfo.error.name && <div>Type: {debugInfo.error.name}</div>}
                {debugInfo.error.code && <div>Code: {debugInfo.error.code}</div>}
                {debugInfo.error.status && <div>Status: {debugInfo.error.status}</div>}
              </>
            )}
            
            {debugInfo.message && (
              <div>Message: {debugInfo.message}</div>
            )}
            
            {debugInfo.userId && (
              <div>User ID: {debugInfo.userId}</div>
            )}
            
            <div style={{ color: '#666', marginTop: '8px', fontSize: '12px' }}>
              Timestamp: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <button 
              onClick={() => console.log('Debug Info:', debugInfo)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#4953fe', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              Log full details to console
            </button>
            <button 
              onClick={() => setDebugInfo(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Debug Info Panel Component */}
      {debugInfo && process.env.NODE_ENV !== 'production' && (
        <div style={{
          margin: '12px 0',
          padding: '12px',
          border: '1px solid #ddd',
          borderLeft: `4px solid ${
            debugInfo.type === 'custom_auth_success' || debugInfo.type === 'supabase_auth_success' ? '#0a0' :
            debugInfo.type === 'db_connection_error' || debugInfo.type === 'password_verify_error' ? '#c00' :
            debugInfo.type === 'supabase_auth_error' ? '#f90' :
            debugInfo.type === 'supabase_exception' || debugInfo.type === 'critical_error' ? '#f00' : '#666'
          }`,
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          fontSize: '14px',
          marginBottom: '16px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Debug Information:
            <span style={{ 
              color: 'white', 
              backgroundColor: debugInfo.type === 'custom_auth_success' || debugInfo.type === 'supabase_auth_success' ? '#0a0' :
                debugInfo.type === 'db_connection_error' || debugInfo.type === 'password_verify_error' ? '#c00' :
                debugInfo.type === 'supabase_auth_error' ? '#f90' :
                debugInfo.type === 'supabase_exception' || debugInfo.type === 'critical_error' ? '#f00' : '#666',
              padding: '2px 6px', 
              borderRadius: '4px',
              fontSize: '12px',
              marginLeft: '8px'
            }}>
              {debugInfo.type.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {debugInfo.error && (
              <>
                <div>Error: {debugInfo.error.message || 'Unknown error'}</div>
                {debugInfo.error.name && <div>Type: {debugInfo.error.name}</div>}
                {debugInfo.error.code && <div>Code: {debugInfo.error.code}</div>}
                {debugInfo.error.status && <div>Status: {debugInfo.error.status}</div>}
              </>
            )}
            
            {debugInfo.message && (
              <div>Message: {debugInfo.message}</div>
            )}
            
            {debugInfo.userId && (
              <div>User ID: {debugInfo.userId}</div>
            )}
            
            <div style={{ color: '#666', marginTop: '8px', fontSize: '12px' }}>
              Timestamp: {new Date(debugInfo.timestamp).toLocaleString()}
            </div>
          </div>
          
          <div style={{ marginTop: '8px', fontSize: '12px' }}>
            <button 
              onClick={() => console.log('Debug Info:', debugInfo)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#4953fe', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0'
              }}
            >
              Log full details to console
            </button>
            <button 
              onClick={() => setDebugInfo(null)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '0',
                marginLeft: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {tab === 'login' && renderLogin()}
      {tab === 'register' && renderRegister()}
      {tab === 'forgot' && renderForgot()}
    </Card>
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
  action?: React.ReactNode;
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

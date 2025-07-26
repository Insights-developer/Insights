"use client";
import { useUser, useStackApp } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppConfig } from "../lib/config";

//
// NOTE: AuthForm uses the `stackApp` abstraction to handle authentication actions (login, registration, password recovery).
// These methods call the app's own API endpoints, which store and authorize user records in the local PostgreSQL `users` table.
// No user data is stored or managed by any third-party auth provider.
//
// App Icon Component
const AppIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

// Icons as SVG components
const LoginIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
  </svg>
);

const RegisterIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
  </svg>
);

const ResetIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const PasswordIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);


export default function AuthForm() {
  const user = useUser();
  const stackApp = useStackApp();
  const router = useRouter();
  const config = useAppConfig();

  const [mode, setMode] = useState<'login' | 'register' | 'recover'>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // If user is still loading (undefined), show loading spinner
  if (typeof user === "undefined") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, show loading or redirect
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === 'login') {
        const signInResult = await stackApp.signInWithCredential({
          email: form.email,
          password: form.password,
        });
        
        if (signInResult.status === 'ok') {
          router.push('/dashboard');
        } else {
          setError('Invalid email or password');
        }
      } else if (mode === 'register') {
        const signUpResult = await stackApp.signUpWithCredential({
          email: form.email,
          password: form.password,
        });
        
        if (signUpResult.status === 'ok') {
          setSuccess('Account created successfully! Please check your email to verify your account.');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else if (mode === 'recover') {
        try {
          await stackApp.sendForgotPasswordEmail(form.email);
          setSuccess('Password reset email sent! Please check your inbox.');
        } catch {
          setError('Failed to send reset email. Please try again.');
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-2 sm:px-6 lg:px-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl">
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/80 p-0 sm:p-0 md:p-0 overflow-hidden">
          {/* Header */}
          <div className="text-center pt-10 pb-6 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg border-4 border-white">
              <AppIcon />
            </div>
            <h2 className="mt-4 text-3xl font-bold text-white drop-shadow">Welcome to {config.appName}</h2>
            <p className="mt-2 text-sm text-blue-100">
              {mode === 'login' ? 'Sign in to your account' :
                mode === 'register' ? 'Create your new account' :
                'Reset your password'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-50/80 px-2 pt-4 pb-2 gap-2">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <LoginIcon />
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <RegisterIcon />
              Sign Up
            </button>
            <button
              onClick={() => setMode('recover')}
              className={`flex-1 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all duration-200 ${
                mode === 'recover'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
              }`}
            >
              <ResetIcon />
              Reset
            </button>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 md:p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Full Name"
                    />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    placeholder="Email address"
                  />
                </div>
              </div>

              {mode !== 'recover' && (
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <PasswordIcon />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={handleInputChange}
                      className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="rounded-xl bg-green-50 p-4 border border-green-200">
                  <p className="text-sm text-green-600">{success}</p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      {mode === 'login' ? 'Sign In' :
                        mode === 'register' ? 'Create Account' :
                        'Send Reset Email'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

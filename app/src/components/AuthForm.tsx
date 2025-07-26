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

import { LogIn, UserPlus, RefreshCcw, User2, Mail, KeyRound, Eye, EyeOff } from "lucide-react";

const AppIcon = () => (
  <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
    <User2 className="w-8 h-8 text-white" />
  </span>
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-8 px-2 sm:px-4 lg:px-8">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto">
        <div className="bg-[var(--card-bg)] rounded-3xl shadow-2xl border border-[var(--card-border)] p-0 overflow-hidden max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center pt-10 pb-6 px-6" style={{ background: 'linear-gradient(90deg, var(--primary), var(--primary-light))' }}>
            <AppIcon />
            <h2 className="mt-4 text-3xl font-bold text-white drop-shadow">Welcome to {config.appName}</h2>
            <p className="mt-2 text-sm text-blue-100">
              {mode === 'login' ? 'Sign in to your account' :
                mode === 'register' ? 'Create your new account' :
                'Reset your password'}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-[var(--gray-light)] px-2 pt-4 pb-2 gap-2">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 px-4 py-2 text-base font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200
                ${mode === 'login'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]`}
            >
              <LogIn className="w-6 h-6" />
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 px-4 py-2 text-base font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200
                ${mode === 'register'
                  ? 'bg-[var(--primary)] text-white shadow-md'
                  : 'text-[var(--foreground)] hover:bg-[var(--primary-light)] hover:text-[var(--primary-dark)] hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-[var(--primary-light)]`}
            >
              <UserPlus className="w-6 h-6" />
              Sign Up
            </button>
            <button
              onClick={() => setMode('recover')}
              className={`flex-1 px-4 py-2 text-base font-semibold flex items-center justify-center gap-2 rounded-xl transition-all duration-200
                ${mode === 'recover'
                  ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md'
                  : 'text-[var(--foreground)] hover:bg-red-50 hover:text-red-600 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-red-300`}
            >
              <RefreshCcw className="w-6 h-6" />
              Reset
            </button>
          </div>

          {/* Form */}
          <div className="p-4 sm:p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="sr-only">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User2 className="w-6 h-6 text-blue-400" />
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
                    <Mail className="w-6 h-6 text-blue-400" />
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
                      <KeyRound className="w-6 h-6 text-blue-400" />
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
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
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

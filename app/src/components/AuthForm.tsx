"use client";
import { useState } from "react";
import VerifyEmailForm from "./VerifyEmailForm";


export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>("login");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showVerify, setShowVerify] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        setSuccess(data.message);
        setShowVerify(true);
      } else if (mode === "login") {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        setSuccess("Login successful!");
        // TODO: Store JWT, redirect, etc.
      } else if (mode === "recover") {
        // TODO: Implement password recovery
        setSuccess("Password recovery email sent!");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const getTabTitle = () => {
    switch (mode) {
      case 'login':
        return 'Welcome Back';
      case 'register':
        return 'Create Account';
      case 'recover':
        return 'Reset Password';
      default:
        return '';
    }
  };

  const getTabSubtitle = () => {
    switch (mode) {
      case 'login':
        return 'Sign in to your account';
      case 'register':
        return 'Join us today';
      case 'recover':
        return 'Enter your email to reset password';
      default:
        return '';
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
            mode === "login"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMode("register")}
          className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
            mode === "register"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          Register
        </button>
        <button
          onClick={() => setMode("recover")}
          className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
            mode === "recover"
              ? "bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          }`}
        >
          Reset
        </button>
      </div>

      {/* Content Area */}
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {getTabTitle()}
          </h1>
          <p className="text-gray-600 text-sm">
            {getTabSubtitle()}
          </p>
        </div>

        {showVerify && mode === "register" ? (
          <VerifyEmailForm email={form.email} />
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "register" && (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      placeholder="Enter your phone number"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              {mode !== "recover" && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                  />
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Please wait...
                  </div>
                ) : (
                  mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Email"
                )}
              </button>
              
              {/* Status Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}
            </form>

            {/* Footer Links */}
            {mode === "login" && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setMode("recover")}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                  type="button"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

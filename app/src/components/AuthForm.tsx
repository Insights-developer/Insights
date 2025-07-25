"use client";
import { useState } from "react";
import VerifyEmailForm from "./VerifyEmailForm";

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

const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
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
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
        {/* Tab Navigation */}
        <div className="flex bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "login"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform -translate-y-0.5"
                : "text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
            }`}
          >
            <LoginIcon />
            <span className="hidden sm:inline">Sign In</span>
            <span className="sm:hidden">Login</span>
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "register"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transform -translate-y-0.5"
                : "text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50"
            }`}
          >
            <RegisterIcon />
            <span className="hidden sm:inline">Register</span>
            <span className="sm:hidden">Join</span>
          </button>
          <button
            onClick={() => setMode("recover")}
            className={`flex-1 py-3 sm:py-4 px-3 sm:px-6 text-xs sm:text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              mode === "recover"
                ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg transform -translate-y-0.5"
                : "text-gray-600 hover:text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50"
            }`}
          >
            <ResetIcon />
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">Reset</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {mode === "login" ? "Sign In" : mode === "register" ? "Create Account" : "Reset Password"}
            </h1>
            <p className="text-gray-600 text-sm">
              {getTabSubtitle()}
            </p>
          </div>

          {showVerify && mode === "register" ? (
            <VerifyEmailForm email={form.email} />
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {mode === "register" && (
                  <>
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <UserIcon />
                        </div>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          placeholder="Enter your full name"
                          value={form.name}
                          onChange={handleChange}
                          className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number <span className="text-gray-400">(optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <PhoneIcon />
                        </div>
                        <input
                          type="text"
                          id="phone"
                          name="phone"
                          placeholder="Enter your phone number"
                          value={form.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <EmailIcon />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                        mode === "login" 
                          ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          : mode === "register" 
                          ? "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          : "focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      }`}
                      required
                    />
                  </div>
                </div>
                {mode !== "recover" && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <PasswordIcon />
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 pl-10 pr-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                          mode === "login" 
                            ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            : "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                        required
                      />
                    </div>
                  </div>
                )}
                <button
                  type="submit"
                  className={`w-full text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base ${
                    mode === "login"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200"
                      : mode === "register"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-200"
                      : "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 focus:ring-4 focus:ring-orange-200"
                  }`}
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
    </div>
  );
}

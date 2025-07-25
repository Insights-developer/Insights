"use client";
import { useState } from "react";
import VerifyEmailForm from "./VerifyEmailForm";
import { useAppConfig } from "../lib/config";

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
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>("login");
  const [showPassword, setShowPassword] = useState(false);
  const appConfig = useAppConfig();
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: ""
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
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            name: form.name
          }),
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
        return `Welcome to ${appConfig.appName}`;
      case 'register':
        return appConfig.tagline;
      case 'recover':
        return 'We\'ll help you get back in';
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
            <span>Login</span>
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
            <span>Join</span>
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
            <span>Reset</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* App Branding Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-3 rounded-2xl ${
                mode === "login" 
                  ? "bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600"
                  : mode === "register"
                  ? "bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600"
                  : "bg-gradient-to-br from-orange-100 to-red-100 text-orange-600"
              }`}>
                <AppIcon />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {appConfig.appName}
            </h1>
            <p className="text-gray-600 text-sm">
              {getTabSubtitle()}
            </p>
            {appConfig.productionState === 'development' && (
              <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                v{appConfig.version} • Development
              </span>
            )}
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
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        className={`w-full border border-gray-300 pl-10 pr-12 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                          mode === "login" 
                            ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            : "focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
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
                    mode === "login" ? "Login" : mode === "register" ? "Create Account" : "Send Reset Link"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

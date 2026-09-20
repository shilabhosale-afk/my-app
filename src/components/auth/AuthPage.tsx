import React, { useState } from 'react';
import {
  Wallet,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { db } from '../../db/storage';
import { User } from '../../types';
import { useToast } from '../common/ToastContext';

interface AuthPageProps {
  onLoginSuccess: (user: User) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const toast = useToast();
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [isForgotPassword, setIsForgotPassword] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('demo@finly.app');
  const [password, setPassword] = useState<string>('password123');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isForgotPassword) {
      if (!email.trim() || !email.includes('@')) {
        setError('Please provide a valid email address');
        return;
      }
      setIsLoading(true);
      setTimeout(() => {
        const res = db.resetPassword(email);
        toast.info(res.message);
        setIsLoading(false);
        setIsForgotPassword(false);
      }, 500);
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const res = db.signUp(name, email);
        setIsLoading(false);
        if (res.success && res.user) {
          toast.success(`Welcome to Finly, ${res.user.name}!`);
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Failed to create account');
        }
      }, 400);
    } else {
      // Login
      if (!email.trim()) {
        setError('Please enter your email');
        return;
      }
      if (!password) {
        setError('Please enter your password');
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        const res = db.login(email);
        setIsLoading(false);
        if (res.success && res.user) {
          toast.success(`Welcome back, ${res.user.name}!`);
          onLoginSuccess(res.user);
        } else {
          setError(res.error || 'Invalid credentials');
        }
      }, 400);
    }
  };

  // Quick 1-click Demo Fill & Login
  const handleQuickDemoLogin = () => {
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      const res = db.login('demo@finly.app');
      setIsLoading(false);
      if (res.success && res.user) {
        toast.success(`Welcome to Finly Demo Workspace!`);
        onLoginSuccess(res.user);
      } else {
        // Fallback: sign up demo user if deleted
        const newDemo = db.signUp('Shila Bhosale', 'demo@finly.app');
        if (newDemo.user) {
          onLoginSuccess(newDemo.user);
        }
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white transition-colors">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left SaaS Brand & Feature Showcase Column (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white p-10 flex-col justify-between relative overflow-hidden">
          {/* Subtle ambient light blur */}
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight">Finly</span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                Finance SaaS
              </span>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-6 my-auto py-8">
            <div>
              <h2 className="text-2xl font-extrabold text-white leading-tight">
                Master your personal wealth with precision.
              </h2>
              <p className="text-sm text-indigo-200/80 mt-2 leading-relaxed">
                Seamless income and expense logging, real-time budget guardrails, and actionable spending insights.
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <PieChart className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-slate-200">Smart multi-category budget threshold alerts</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-200">Month-over-month trend analytics & savings curves</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="text-slate-200">Privacy-first local storage & data export</span>
              </div>
            </div>
          </div>

          {/* Footer quote */}
          <div className="relative z-10 pt-4 border-t border-indigo-800/40 text-[11px] text-indigo-300/70">
            Default currency configured in Indian Rupees (₹) • 100% Client-Side Privacy
          </div>
        </div>

        {/* Right Auth Form Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mobile Brand Header */}
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">Finly</span>
            </div>

            {/* Title */}
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {isForgotPassword
                  ? 'Reset your password'
                  : isSignUp
                  ? 'Create your Finly account'
                  : 'Welcome back'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isForgotPassword
                  ? 'Enter your registered email to receive recovery instructions.'
                  : isSignUp
                  ? 'Start managing personal cashflow and budget goals today.'
                  : 'Enter your credentials to access your financial dashboard.'}
              </p>
            </div>

            {/* 1-Click Quick Demo Login Button */}
            {!isForgotPassword && (
              <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 p-3.5 rounded-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Demo Account Ready
                      </p>
                      <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/80">
                        Explore pre-populated expenses, budgets & charts
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={isLoading}
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
                  >
                    1-Click Demo
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl">
                {error}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && !isForgotPassword && (
                <div>
                  <label
                    htmlFor="auth-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-name"
                      type="text"
                      placeholder="e.g. Shila Bhosale"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="auth-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="auth-password"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="auth-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {isForgotPassword
                        ? 'Send Reset Instructions'
                        : isSignUp
                        ? 'Create Account'
                        : 'Sign In to Dashboard'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle between login / signup / forgot */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  ← Back to Login
                </button>
              ) : isSignUp ? (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      setError('');
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Log In
                  </button>
                </p>
              ) : (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setError('');
                    }}
                    className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Sign Up Free
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Database,
  ExternalLink,
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getSupabaseConfig } from '../lib/supabase';

interface AdminLoginProps {
  isModal?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  reasonMessage?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  isModal = false,
  onClose,
  onSuccess,
  reasonMessage,
}) => {
  const { login, loading, authError, clearAuthError, isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  const supabaseConfig = getSupabaseConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!email || !password) return;

    const res = await login(email, password);
    if (res.success) {
      if (onSuccess) onSuccess();
      if (onClose) onClose();
    }
  };

  const formContent = (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 mb-3 border border-cyan-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-heading">
          Administrator Authentication
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          {reasonMessage || 'Sign in to access the TechPilot AI Editorial Board and publish manuscripts.'}
        </p>
      </div>

      {/* Connection Indicator */}
      <div className="mb-5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">Auth Engine:</span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
            {supabaseConfig.url.replace(/^https?:\/\//, '')}
          </span>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
          isConfigured 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {isConfigured ? 'Supabase Connected' : 'Anon Key Missing'}
        </span>
      </div>

      {/* Error Alert */}
      {authError && (
        <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-semibold">Authentication Error</p>
            <p className="mt-0.5 leading-relaxed">{authError}</p>
          </div>
          <button 
            type="button"
            onClick={clearAuthError}
            className="text-rose-500 hover:text-rose-700 p-0.5 rounded"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Administrator Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError) clearAuthError();
              }}
              placeholder="admin@techpilot.internal"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError) clearAuthError();
              }}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full mt-2 py-3 px-4 bg-slate-900 dark:bg-cyan-600 hover:bg-slate-800 dark:hover:bg-cyan-500 disabled:bg-slate-400 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating with Supabase...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Sign In to Editorial Board</span>
            </>
          )}
        </button>
      </form>

      {/* Security & Access Notice */}
      <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <p>
            <strong className="text-slate-700 dark:text-slate-300">Restricted Access:</strong> Public sign-up is permanently disabled. Administrators are provisioned manually in the Supabase Dashboard under <em>Authentication &gt; Users</em>.
          </p>
        </div>

        {/* Toggleable Setup Guide for the Owner */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowSetupGuide(!showSetupGuide)}
            className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:underline inline-flex items-center gap-1"
          >
            <span>{showSetupGuide ? 'Hide' : 'Need to create an administrator in Supabase?'}</span>
          </button>

          {showSetupGuide && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                How to create your Admin User in Supabase:
              </p>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open your Supabase Project: <code className="text-cyan-600 dark:text-cyan-400">https://qusbrdwetykqhpmjxpcr.supabase.co</code></li>
                <li>Go to <strong>Authentication</strong> &gt; <strong>Users</strong> in the left sidebar.</li>
                <li>Click <strong>Add user</strong> &gt; <strong>Create user</strong>.</li>
                <li>Enter your desired email (e.g. your email) and a secure password.</li>
                <li>Check <strong>Auto Confirm User</strong> so the account is immediately active without email confirmation.</li>
                <li>Click <strong>Create user</strong> and log in above!</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto py-12 px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
        {formContent}
      </div>
    </div>
  );
};

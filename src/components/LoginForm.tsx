import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<Props> = ({ onSuccess, onSwitchToRegister }) => {
  const { login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(username, password);
    setIsSubmitting(false);

    if (res.success) {
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'লগইন ব্যর্থ হয়েছে।');
    }
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          id="login-error-alert"
          className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="login-username-input"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
        >
          ইউজারনেম (Username)
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="login-username-input"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="আপনার ইউজারনেম"
            required
            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="login-password-input"
          className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
        >
          পাসওয়ার্ড (Password)
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="login-password-input"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        id="login-submit-button"
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
      >
        <LogIn className="w-4 h-4" />
        {isSubmitting ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন (Login)'}
      </button>

      {/* Switch to Register Button */}
      {onSwitchToRegister && (
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            id="login-create-account-button"
            onClick={onSwitchToRegister}
            className="w-full py-2.5 px-4 bg-slate-50 hover:bg-teal-50 text-teal-700 hover:text-teal-800 border border-slate-200 hover:border-teal-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5 text-teal-600" />
            <span>নতুন অ্যাকাউন্ট তৈরি করুন (Create Account)</span>
          </button>
        </div>
      )}
    </form>
  );
};

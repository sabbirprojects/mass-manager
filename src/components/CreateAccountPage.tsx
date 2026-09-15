import React, { useState, useMemo } from 'react';
import {
  Utensils,
  User,
  AtSign,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  UserPlus,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

export const CreateAccountPage: React.FC<Props> = ({
  onSwitchToLogin,
  onSuccess,
}) => {
  const { userAccounts, createUserAccount, login } = useApp();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Username availability check
  const cleanUsername = username.trim().toLowerCase();
  const usernameTaken = useMemo(() => {
    if (!cleanUsername) return false;
    return userAccounts.some((acc) => acc.username.toLowerCase() === cleanUsername);
  }, [userAccounts, cleanUsername]);

  const isUsernameValid = cleanUsername.length >= 3 && /^[a-z0-9_]+$/.test(cleanUsername);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (password.length >= 4) score += 1;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { score: 1, label: 'দুর্বল (Weak)', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'মোটামুটি (Fair)', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'ভালো (Good)', color: 'bg-teal-500' };
    return { score: 4, label: 'খুব শক্তিশালী (Strong)', color: 'bg-emerald-600' };
  }, [password]);

  // Password match verification
  const passwordsMatch = password.length > 0 && confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Client-side validations
    if (!displayName.trim()) {
      setError('দয়া করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে (যেমন: sabbir, tonmoy1)।');
      return;
    }

    if (!/^[a-z0-9_]+$/.test(cleanUsername)) {
      setError('ইউজারনেমে শুধুমাত্র ইংরেজি ছোট অক্ষর (a-z), সংখ্যা (0-9) এবং আন্ডারস্কোর (_) ব্যবহার করা যাবে।');
      return;
    }

    if (usernameTaken) {
      setError(`'@${cleanUsername}' ইউজারনেমটি ইতিমধ্যে ব্যবহৃত হয়েছে। অন্য একটি ইউজারনেম পছন্দ করুন।`);
      return;
    }

    if (!password || password.length < 4) {
      setError('পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setError('দুইবারের পাসওয়ার্ড হুবহু মিলেনি। পুনরায় সঠিক পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create account
      const createRes = await createUserAccount(
        cleanUsername,
        displayName.trim(),
        password,
        phone.trim() || undefined
      );

      if (!createRes.success) {
        setError(createRes.error || 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে।');
        setIsSubmitting(false);
        return;
      }

      // 2. If autoLogin enabled, log in immediately
      if (autoLogin) {
        setSuccessMessage('অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে! স্বয়ংক্রিয়ভাবে প্রবেশ করানো হচ্ছে...');
        const loginRes = await login(cleanUsername, password);
        if (loginRes.success) {
          if (onSuccess) onSuccess();
        } else {
          // If login failed for some reason, inform and redirect to login page
          setSuccessMessage('অ্যাকাউন্ট তৈরি সফল হয়েছে। এখন ইউজারনেম ও পাসওয়ার্ড দিয়ে লগইন করুন।');
          setTimeout(() => {
            onSwitchToLogin();
          }, 1500);
        }
      } else {
        setSuccessMessage('অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে! এখন লগইন করুন।');
        setTimeout(() => {
          onSwitchToLogin();
        }, 1500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'অপ্রত্যাশিত সমস্যা দেখা দিয়েছে।';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="create-account-page"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8 sm:py-12"
    >
      <div className="w-full max-w-md">
        {/* Top Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/10 mb-3">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Smart Meal Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            নতুন ইউজার রেজিস্ট্রেশন — সম্পূর্ণ মেস হিসাব পরিচালনা
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <UserPlus className="w-5 h-5 text-teal-600" />
              <span>নতুন অ্যাকাউন্ট তৈরি (Register)</span>
            </div>
            <button
              type="button"
              id="back-to-login-btn-top"
              onClick={onSwitchToLogin}
              className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>লগইন পেজ</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            নতুন সদস্য হিসেবে আপনার বিবরণ দিন। এই অ্যাকাউন্টের মাধ্যমে আপনি মিল এন্ট্রি, বাজার খরচ এবং ব্যালেন্স রিপোর্ট দেখতে ও পরিচালনা করতে পারবেন।
          </p>

          {/* Error Alert */}
          {error && (
            <div
              id="register-error-alert"
              className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Alert */}
          {successMessage && (
            <div
              id="register-success-alert"
              className="p-3 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form id="create-account-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Display Name */}
            <div>
              <label
                htmlFor="register-display-name-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                পূর্ণ নাম (Display Name) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-display-name-input"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="যেমন: সাকিব হাসান অথবা Tanvir Ahmed"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                রিপোর্ট এবং মিল তালিকার সব জায়গায় এই নাম প্রদর্শিত হবে।
              </span>
            </div>

            {/* 2. Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="register-username-input"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  ইউজারনেম (Username) <span className="text-rose-500">*</span>
                </label>
                {cleanUsername.length >= 3 && (
                  <span
                    className={`text-[11px] font-semibold ${
                      usernameTaken ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    {usernameTaken ? '✕ ইউজারনেম খালি নেই' : '✓ ইউজারনেম উপলব্ধ'}
                  </span>
                )}
              </div>
              <div className="relative">
                <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-username-input"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  placeholder="যেমন: sakib অথবা sabbir_99"
                  required
                  className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition ${
                    usernameTaken
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : cleanUsername.length >= 3 && isUsernameValid
                      ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-600'
                  }`}
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                লগইনের জন্য ব্যবহৃত হবে। ইংরেজি ছোট অক্ষর ও সংখ্যা দিয়ে তৈরি করুন।
              </span>
            </div>

            {/* 3. Phone Number (Optional) */}
            <div>
              <label
                htmlFor="register-phone-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                মোবাইল নম্বর (Phone) <span className="text-slate-400 font-normal lowercase">(ঐচ্ছিক)</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-phone-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition"
                />
              </div>
            </div>

            {/* 4. Password */}
            <div>
              <label
                htmlFor="register-password-input"
                className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider"
              >
                পাসওয়ার্ড (Password) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="কমপক্ষে ৪ অক্ষরের পাসওয়ার্ড"
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500">পাসওয়ার্ডের শক্তি:</span>
                    <span className="font-semibold text-slate-700">{passwordStrength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 1 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 2 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 3 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    />
                    <div
                      className={`h-full flex-1 rounded-full ${
                        passwordStrength.score >= 4 ? passwordStrength.color : 'bg-slate-200'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 5. Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="register-confirm-password-input"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  পাসওয়ার্ড নিশ্চিত করুন (Confirm Password) <span className="text-rose-500">*</span>
                </label>
                {passwordsMatch && (
                  <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> পাসওয়ার্ড মিলেছে
                  </span>
                )}
                {passwordsMismatch && (
                  <span className="text-[11px] font-semibold text-rose-500">
                    ✕ পাসওয়ার্ড মেলেনি
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="register-confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পুনরায় পাসওয়ার্ড লিখুন"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 text-sm bg-white border rounded-xl focus:outline-hidden focus:ring-2 transition ${
                    passwordsMismatch
                      ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                      : passwordsMatch
                      ? 'border-emerald-400 focus:ring-emerald-500/20 focus:border-emerald-500'
                      : 'border-slate-200 focus:ring-teal-500/20 focus:border-teal-600'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Auto-login Toggle */}
            <label className="flex items-center gap-2 pt-1 text-xs text-slate-700 cursor-pointer select-none">
              <input
                id="register-autologin-checkbox"
                type="checkbox"
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="w-4 h-4 text-teal-600 rounded-md border-slate-300 focus:ring-teal-500"
              />
              <span>অ্যাকাউন্ট তৈরির সাথে সাথে স্বয়ংক্রিয়ভাবে লগইন করুন</span>
            </label>

            {/* Submit Button */}
            <button
              id="register-submit-button"
              type="submit"
              disabled={isSubmitting || usernameTaken}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-sm font-semibold rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>অ্যাকাউন্ট তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>{autoLogin ? 'অ্যাকাউন্ট তৈরি ও লগইন করুন' : 'অ্যাকাউন্ট নিবন্ধন করুন'}</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login Footer */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              ইতিমধ্যে আপনার মেস অ্যাকাউন্ট আছে?{' '}
              <button
                type="button"
                id="switch-to-login-link"
                onClick={onSwitchToLogin}
                className="text-teal-700 hover:text-teal-800 font-bold hover:underline ml-1 cursor-pointer"
              >
                লগইন করুন (Log In)
              </button>
            </p>
          </div>
        </div>

        {/* Security / System Footer Info */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>অফলাইন-ফার্স্ট • SHA-256 এনক্রিপশন • সম্পূর্ণ মেস ডাটা নিরাপত্তা</span>
        </div>
      </div>
    </div>
  );
};

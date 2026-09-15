import React, { useState, useEffect } from 'react';
import { Utensils, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { CreateAccountPage } from './CreateAccountPage';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { userAccounts } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#register' || hash === '#create-account' || hash === '#signup') {
        return 'register';
      }
    }
    return userAccounts.length === 0 ? 'register' : 'login';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#register' || hash === '#create-account' || hash === '#signup') {
        setMode('register');
      } else if (hash === '#login' || hash === '#signin') {
        setMode('login');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSwitchToRegister = () => {
    setMode('register');
    if (typeof window !== 'undefined') {
      window.location.hash = 'register';
    }
  };

  const handleSwitchToLogin = () => {
    setMode('login');
    if (typeof window !== 'undefined') {
      window.location.hash = 'login';
    }
  };

  // If user requested or toggled to registration mode, render the dedicated CreateAccountPage
  if (mode === 'register') {
    return (
      <CreateAccountPage
        onSwitchToLogin={handleSwitchToLogin}
      />
    );
  }

  return (
    <div
      id="login-page-container"
      className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8"
    >
      <div className="w-full max-w-md">
        {/* Branding Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-600 text-white shadow-md shadow-teal-600/10 mb-3">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 id="app-brand-title" className="text-2xl font-bold text-slate-900 tracking-tight">
            Smart Meal Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            স্মার্ট মেস ম্যানেজার — মোবাইল-ফার্স্ট ও নির্ভরযোগ্য হিসাব
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7">
          {/* Top Auth Mode Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5 border border-slate-200/60">
            <button
              type="button"
              id="auth-tab-login"
              onClick={handleSwitchToLogin}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 text-teal-600" />
              <span>লগইন (Login)</span>
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={handleSwitchToRegister}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-teal-600" />
              <span>নতুন অ্যাকাউন্ট (Register)</span>
            </button>
          </div>

          <LoginForm onSwitchToRegister={handleSwitchToRegister} />
        </div>

        {/* Security & Multi-Account Clarification */}
        <div className="mt-5 text-center flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>অফলাইন-ফার্স্ট • নিরাপদ পাসওয়ার্ড হ্যাশিং • পূর্ণ অডিট ট্র্যাকিং</span>
        </div>
      </div>
    </div>
  );
};

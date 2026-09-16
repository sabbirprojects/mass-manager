import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertCircle, Copy, Check, ExternalLink, Key, Globe, Trash2 } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
} from '../utils/supabase';
import { useApp } from '../context/AppContext';

export const SupabaseConfig: React.FC = () => {
  const { showToast } = useApp();
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds) {
      setUrl(creds.url);
      setAnonKey(creds.anonKey);
    }
    setIsConnected(isSupabaseConfigured());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !anonKey.trim()) {
      showToast('দয়া করে Supabase URL ও Anon Key পূরণ করুন।', 'error');
      return;
    }

    saveSupabaseCredentials(url, anonKey);
    setIsConnected(isSupabaseConfigured());
    showToast('Supabase ডেটাবেজ ক্রেডেনশিয়াল সংরক্ষিত হয়েছে! পেজ রিলোড করা হচ্ছে...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setUrl('');
    setAnonKey('');
    setIsConnected(false);
    showToast('Supabase ক্রেডেনশিয়াল মুছে ফেলা হয়েছে। লোকাল মোডে ফিরছে...', 'info');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleCopySqlHint = () => {
    navigator.clipboard.writeText(`-- Run the content of supabase_schema.sql in Supabase SQL Editor`);
    setIsCopied(true);
    showToast('SQL নির্দেশিকা কপি করা হয়েছে!', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div id="supabase-config-container" className="space-y-4">
      {/* Status Header */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}
          >
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">ক্লাউড ডেটাবেজ (Supabase Cloud)</h3>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                  isConnected
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {isConnected ? 'সংযুক্ত (Connected)' : 'লোকাল মোড (Local / Unconfigured)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              সব ব্রাউজার ও ডিভাইসে রিয়েল-টাইম লগইন ও মেস ডাটা সিঙ্কের জন্য Supabase ব্যবহার করুন।
            </p>
          </div>
        </div>

        {isConnected && (
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold transition border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>সংযোগ বিচ্ছিন্ন</span>
          </button>
        )}
      </div>

      {/* Configuration Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
          Supabase প্রজেক্ট সেটিংস (Project Credentials)
        </h4>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-teal-600" />
              <span>Project URL</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              required
              className="w-full px-3.5 py-2.5 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-teal-600" />
              <span>Anon Public Key</span>
            </label>
            <textarea
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              rows={2}
              required
              className="w-full px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              * Vercel-এ পার্মানেন্ট রাখতে Vercel Dashboard এর Environment Variables-এ <code>VITE_SUPABASE_URL</code> ও <code>VITE_SUPABASE_ANON_KEY</code> হিসেবে যোগ করুন।
            </p>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              সংরক্ষণ ও সংযোগ করুন
            </button>
          </div>
        </form>
      </div>

      {/* SQL Setup Instructions Box */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-teal-600" />
            <h4 className="text-xs font-bold text-slate-800">Supabase SQL টেবিল সেটআপ</h4>
          </div>
          <button
            type="button"
            onClick={handleCopySqlHint}
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 inline-flex items-center gap-1"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          আপনার Supabase ড্যাশবোর্ডে <strong>SQL Editor</strong>-এ গিয়ে প্রজেক্টের রুট ডিরেক্টরির <code>supabase_schema.sql</code> ফাইলের কোডটুকু পেস্ট করে <strong>Run</strong> করুন। এটি স্বয়ংক্রিয়ভাবে <code>user_accounts</code> ও <code>user_workspaces</code> টেবিল এবং ডেমো ইউজার তৈরি করে দেবে।
        </p>
      </div>
    </div>
  );
};

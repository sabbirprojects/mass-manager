import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, AlertTriangle, CheckCircle, Database } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportAppDataAsJson, importAppDataFromJson, resetStorageToSeed } from '../utils/storage';

export const BackupRestore: React.FC = () => {
  const { openConfirm, showToast, refreshState } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleExport = () => {
    try {
      const jsonStr = exportAppDataAsJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `mess-manager-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('ব্যাকআপ JSON ফাইল সফলভাবে ডাউনলোড হয়েছে', 'success');
    } catch (e) {
      showToast('ব্যাকআপ ফাইল তৈরিতে ব্যর্থ হয়েছে', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      openConfirm({
        title: 'ডাটাবেস রিস্টোর নিশ্চিতকরণ (Database Restore)',
        message:
          'ব্যাকআপ ফাইল থেকে ডাটা রিস্টোর করলে বর্তমানের স্থানীয় ডাটা ওভাররাইট হয়ে যাবে। আপনি কি এগিয়ে যেতে চান?',
        confirmLabel: 'রিস্টোর করুন',
        isDestructive: true,
        onConfirm: () => {
          const res = importAppDataFromJson(content);
          if (res.success) {
            refreshState();
            showToast('ডাটা সফলভাবে রিস্টোর হয়েছে!', 'success');
            setStatusMsg({ text: 'ডাটাবেস সফলভাবে রিস্টোর করা হয়েছে।' });
          } else {
            showToast(res.error || 'রিস্টোর ব্যর্থ হয়েছে', 'error');
            setStatusMsg({ text: res.error || 'ফাইল ভ্যালিডেশন ব্যর্থ।', isError: true });
          }
        },
      });
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const handleReset = () => {
    openConfirm({
      title: 'ডাটা রিসেট ও প্রাথমিক ডেমো লোড',
      message:
        'আপনি কি সমস্ত ডাটা মুছে প্রাথমিক ডেমো ডাটায় ফিরে যেতে চান? পূর্বের সংরক্ষিত তথ্য মুছে যাবে।',
      confirmLabel: 'সব মুছে রিসেট করুন',
      isDestructive: true,
      onConfirm: () => {
        resetStorageToSeed();
        refreshState();
        showToast('ডাটাবেস সফলভাবে রিসেট করা হয়েছে', 'info');
      },
    });
  };

  return (
    <div id="backup-restore-container" className="space-y-4">
      <div>
        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          <span>ব্যাকআপ ও ডাটাবেস রিস্টোর (Backup & Data Safety)</span>
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          আপনার মেসের সমস্ত হিসাব (সদস্য, মিল, বাজার, জমা, অ্যাকাউন্টস) অফলাইন JSON ফাইলে সংরক্ষণ ও যে কোনো ডিভাইসে রিস্টোর করুন।
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 text-xs font-medium rounded-xl border flex items-center gap-2 ${
            statusMsg.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {statusMsg.isError ? (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Export Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl w-fit mb-2">
              <Download className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">ব্যাকআপ ডাউনলোড</h5>
            <p className="text-xs text-slate-500 mt-1">
              সম্পূর্ণ ডাটাবেসের একটি কপি .json ফাইল হিসেবে ডিভাইসে সেভ করুন।
            </p>
          </div>
          <button
            id="export-backup-btn"
            type="button"
            onClick={handleExport}
            className="mt-3.5 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON ব্যাকআপ নিন</span>
          </button>
        </div>

        {/* Restore Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl w-fit mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">ডাটা রিস্টোর</h5>
            <p className="text-xs text-slate-500 mt-1">
              পূর্বে ডাউনলোড করা ব্যাকআপ JSON ফাইল আপলোড করে তথ্য পুনরুদ্ধার করুন।
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            id="import-backup-btn"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3.5 w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ফাইল নির্বাচন ও রিস্টোর</span>
          </button>
        </div>

        {/* Reset Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl w-fit mb-2">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h5 className="text-sm font-bold text-slate-900">ফ্যাক্টরি রিসেট</h5>
            <p className="text-xs text-slate-500 mt-1">
              পরীক্ষামূলক কাজের জন্য প্রাথমিক ডেমো ডাটায় ফিরে যান।
            </p>
          </div>
          <button
            id="factory-reset-btn"
            type="button"
            onClick={handleReset}
            className="mt-3.5 w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>রিসেট ও ডেমো ডাটা</span>
          </button>
        </div>
      </div>
    </div>
  );
};

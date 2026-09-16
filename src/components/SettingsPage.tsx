import React, { useState } from 'react';
import { Settings, Users, Database, Shield, Sliders, Lock, Check, Cloud } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAccountList } from './UserAccountList';
import { BackupRestore } from './BackupRestore';
import { AuditHistory } from './AuditHistory';
import { LockStatus } from './LockStatus';
import { SupabaseConfig } from './SupabaseConfig';
import { formatTaka } from '../utils/calculations';

export const SettingsPage: React.FC = () => {
  const { activeMonth, updateMonthCalculationMode, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'calc' | 'users' | 'cloud' | 'backup' | 'audit'>('calc');

  const [mode, setMode] = useState<'auto' | 'fixed'>(activeMonth?.calculationMode || 'auto');
  const [fixedRate, setFixedRate] = useState<number | string>(
    activeMonth?.fixedMealRate || 65
  );

  React.useEffect(() => {
    if (activeMonth) {
      setMode(activeMonth.calculationMode);
      setFixedRate(activeMonth.fixedMealRate || 65);
    }
  }, [activeMonth]);

  const handleSaveCalculationMode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMonth) return;

    const rateNum = mode === 'fixed' ? parseFloat(fixedRate.toString()) || 0 : undefined;
    const res = updateMonthCalculationMode(activeMonth.id, mode, rateNum);
    if (res.success) {
      showToast('হিসাব গণনা মোড সফলভাবে সংরক্ষিত হয়েছে', 'success');
    } else {
      showToast(res.error || 'আপডেট ব্যর্থ হয়েছে', 'error');
    }
  };

  return (
    <div id="settings-page-container" className="space-y-4">
      {/* Sub-navigation tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto no-scrollbar">
        <button
          id="settings-tab-calc"
          type="button"
          onClick={() => setActiveTab('calc')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'calc'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-teal-600" />
          <span>হিসাব ও মিল রেট</span>
        </button>

        <button
          id="settings-tab-users"
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-sky-600" />
          <span>ইউজার অ্যাকাউন্টস</span>
        </button>

        <button
          id="settings-tab-cloud"
          type="button"
          onClick={() => setActiveTab('cloud')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'cloud'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span>ক্লাউড সিঙ্ক (Supabase)</span>
        </button>

        <button
          id="settings-tab-backup"
          type="button"
          onClick={() => setActiveTab('backup')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'backup'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>ব্যাকআপ ও রিস্টোর</span>
        </button>

        <button
          id="settings-tab-audit"
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-amber-600" />
          <span>অডিট ট্রেইল</span>
        </button>
      </div>

      {/* Tab: Calculation Mode and Month Lock */}
      {activeTab === 'calc' && (
        <div className="space-y-4">
          <LockStatus />

          {activeMonth && (
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  মিল রেট নির্ধারণ পদ্ধতি (Calculation Rules)
                </h3>
              </div>

              <form onSubmit={handleSaveCalculationMode} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                      mode === 'auto'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-950'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="calcMode"
                      value="auto"
                      checked={mode === 'auto'}
                      onChange={() => setMode('auto')}
                      className="mt-1 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-xs font-bold block">স্বয়ংক্রিয় মিল রেট (Auto Calculated)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        বাজার খরচ ÷ মোট মিল = স্বতঃস্ফূর্ত মিল রেট। প্রতিবার বাজার বা মিল পরিবর্তনের সাথে রিয়েল-টাইমে আপডেট হয়।
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition ${
                      mode === 'fixed'
                        ? 'border-teal-500 bg-teal-50/50 text-teal-950'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="calcMode"
                      value="fixed"
                      checked={mode === 'fixed'}
                      onChange={() => setMode('fixed')}
                      className="mt-1 text-teal-600 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-xs font-bold block">ফিক্সড মিল রেট (Fixed Rate)</span>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        বাজার খরচ যাই হোক, মিলের খরচ পূর্বনির্ধারিত একটি নির্দিষ্ট হারে হিসাব হবে।
                      </p>
                    </div>
                  </label>
                </div>

                {mode === 'fixed' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 max-w-sm">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      নির্দিষ্ট মিল রেট (টাকা/মিল) *
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={fixedRate}
                      onChange={(e) => setFixedRate(e.target.value)}
                      required
                      placeholder="e.g. 65"
                      className="w-full px-3 py-2 text-sm font-bold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                    />
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                  >
                    <Check className="w-4 h-4" />
                    <span>সেটিংস সংরক্ষণ করুন</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Tab: User Accounts */}
      {activeTab === 'users' && <UserAccountList />}

      {/* Tab: Cloud Database (Supabase) */}
      {activeTab === 'cloud' && <SupabaseConfig />}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && <BackupRestore />}

      {/* Tab: Audit Log */}
      {activeTab === 'audit' && <AuditHistory />}
    </div>
  );
};

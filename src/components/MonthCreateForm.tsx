import React, { useState } from 'react';
import { Calendar, X, ArrowRight, CheckSquare, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CalculationMode } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthCreateForm: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createMonth, months, activeMonth } = useApp();

  const now = new Date();
  const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const defaultYear = nextMonthDate.getFullYear();
  const defaultMonthIndex = nextMonthDate.getMonth();
  const defaultMonthName = nextMonthDate.toLocaleString('en-US', { month: 'long' });

  const defaultStart = new Date(defaultYear, defaultMonthIndex, 1).toISOString().slice(0, 10);
  const defaultEnd = new Date(defaultYear, defaultMonthIndex + 1, 0).toISOString().slice(0, 10);

  const [name, setName] = useState(`${defaultMonthName} ${defaultYear}`);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [mode, setMode] = useState<CalculationMode>('auto');
  const [fixedRate, setFixedRate] = useState<number>(65);
  const [importPreviousMonthId, setImportPreviousMonthId] = useState<string>(
    activeMonth?.id || (months[0]?.id ?? '')
  );
  const [shouldImportMembers, setShouldImportMembers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = createMonth({
      name,
      startDate,
      endDate,
      calculationMode: mode,
      fixedMealRate: mode === 'fixed' ? Number(fixedRate) : undefined,
      importPreviousMonthId: shouldImportMembers ? importPreviousMonthId : undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'নতুন মাস তৈরি করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div
      id="month-create-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="month-create-modal"
        className="w-full max-w-lg rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <Calendar className="w-5 h-5 text-teal-600" />
            <span>নতুন মাস তৈরি করুন (New Month)</span>
          </div>
          <button
            id="close-month-create-modal"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মাসের নাম (Month Name)
            </label>
            <input
              id="new-month-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. October 2026 (অক্টোবর ২০২৬)"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                শুরুর তারিখ (Start Date)
              </label>
              <input
                id="new-month-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                সমাপ্তির তারিখ (End Date)
              </label>
              <input
                id="new-month-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          {/* Calculation Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              হিসাবের মোড (Calculation Mode)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="mode-auto-rate-btn"
                onClick={() => setMode('auto')}
                className={`p-3 text-left rounded-xl border transition ${
                  mode === 'auto'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Auto Rate Mode</span>
                  {mode === 'auto' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  মোট বাজার খরচ ÷ মোট মিল
                </p>
              </button>

              <button
                type="button"
                id="mode-fixed-rate-btn"
                onClick={() => setMode('fixed')}
                className={`p-3 text-left rounded-xl border transition ${
                  mode === 'fixed'
                    ? 'border-teal-600 bg-teal-50/70 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="font-semibold text-xs flex items-center justify-between">
                  <span>Fixed Rate Mode</span>
                  {mode === 'fixed' && <span className="w-2 h-2 rounded-full bg-teal-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  প্রতি মিলের জন্য নির্দিষ্ট রেট
                </p>
              </button>
            </div>

            {mode === 'fixed' && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ফিক্সড মিল রেট (টাকা/মিল)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={fixedRate}
                  onChange={(e) => setFixedRate(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}
          </div>

          {/* Carry-Forward Section */}
          {months.length > 0 && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    id="import-members-checkbox"
                    type="checkbox"
                    checked={shouldImportMembers}
                    onChange={(e) => setShouldImportMembers(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                  />
                  <label
                    htmlFor="import-members-checkbox"
                    className="text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    আগের মাস থেকে সদস্য ও ব্যালেন্স ক্যারি-ফরওয়ার্ড (Carry Forward)
                  </label>
                </div>
              </div>

              {shouldImportMembers && (
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    কোন মাস থেকে ব্যালেন্স ইমপোর্ট করবেন:
                  </label>
                  <select
                    id="import-source-month-select"
                    value={importPreviousMonthId}
                    onChange={(e) => setImportPreviousMonthId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    {months.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.status.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    সদস্যদের নাম ও বিগত মাসের শেষ ব্যালেন্স নতুন মাসে পূর্বের ব্যালেন্স (Previous Balance) হিসেবে যুক্ত হবে। মিল ও জমা শূন্য থেকে শুরু হবে।
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              id="confirm-create-month-btn"
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition"
            >
              মাস তৈরি করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

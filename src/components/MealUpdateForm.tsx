import React, { useState } from 'react';
import { X, Calendar, Utensils, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  date: string;
  currentMeal: number;
}

export const MealUpdateForm: React.FC<Props> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  date,
  currentMeal,
}) => {
  const { setDailyMeal } = useApp();
  const [newMeal, setNewMeal] = useState<number | string>(currentMeal);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(newMeal.toString());
    if (isNaN(val) || val < 0) {
      setError('সঠিক মিল সংখ্যা দিন (0 বা তার বেশি)।');
      return;
    }

    const res = setDailyMeal({
      memberId,
      date,
      mealCount: val,
      reason: reason.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'মিল আপডেট করতে ব্যর্থ হয়েছে।');
    }
  };

  return (
    <div
      id="meal-update-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="meal-update-modal"
        className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm sm:text-base">
            <Utensils className="w-4 h-4 text-teal-600" />
            <span>মিল আপডেট (Meal Update)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 p-3 bg-slate-50 rounded-xl text-xs space-y-1">
          <div className="flex justify-between text-slate-600">
            <span>সদস্য:</span>
            <b className="text-slate-900">{memberName}</b>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>তারিখ:</span>
            <b className="text-slate-900">{date}</b>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>বর্তমান মিল:</span>
            <span className="font-bold text-teal-700">{currentMeal}</span>
          </div>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              নতুন মিল সংখ্যা (New Meal Count)
            </label>
            <input
              id="new-meal-count-input"
              type="number"
              step="0.5"
              min="0"
              value={newMeal}
              onChange={(e) => setNewMeal(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-base font-semibold text-slate-900 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পরিবর্তনের কারণ (Reason - ঐচ্ছিক)
            </label>
            <input
              id="meal-update-reason-input"
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. বাসায় চলে গিয়েছিল / অতিরিক্ত মেহমান"
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              id="save-meal-update-btn"
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

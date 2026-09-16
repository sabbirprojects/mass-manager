import React, { useState } from 'react';
import { X, Calendar, Utensils, Save, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const MealEntry: React.FC<Props> = ({ isOpen, onClose }) => {
  const { members, activeMonth, batchUpdateMealsForDate, dailyMeals } = useApp();

  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === activeMonth?.id);
  const todayStr = getLocalDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Initialize member meal inputs for selected date
  const [mealValues, setMealValues] = useState<Record<string, number | string>>({});

  React.useEffect(() => {
    if (!isOpen) return;
    const initialVals: Record<string, number | string> = {};
    for (const mem of activeMembers) {
      const existing = dailyMeals.find(
        (dm) => dm.monthId === activeMonth?.id && dm.memberId === mem.id && dm.date === selectedDate
      );
      initialVals[mem.id] = existing ? existing.mealCount : 2; // Default 2 meals
    }
    setMealValues(initialVals);
  }, [isOpen, selectedDate, activeMembers.length]);

  if (!isOpen) return null;

  const handleQuickSetAll = (val: number) => {
    const updated: Record<string, number | string> = {};
    for (const mem of activeMembers) {
      updated[mem.id] = val;
    }
    setMealValues(updated);
  };

  const handleMemberChange = (memberId: string, val: string) => {
    setMealValues((prev) => ({ ...prev, [memberId]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const records = activeMembers.map((mem) => ({
      memberId: mem.id,
      mealCount: parseFloat((mealValues[mem.id] ?? 0).toString()) || 0,
    }));

    const res = batchUpdateMealsForDate(selectedDate, records);
    if (res.success) {
      onClose();
    }
  };

  return (
    <div
      id="meal-entry-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="meal-entry-modal"
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <Utensils className="w-5 h-5 text-amber-600" />
            <span>দৈনিক মিল এন্ট্রি (Daily Meal Entry)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Date Selector */}
        <div className="py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>তারিখ নির্বাচন:</span>
          </div>
          <input
            id="meal-entry-date-picker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
          />
        </div>

        {/* Quick fill buttons */}
        <div className="py-2.5 flex items-center justify-between text-xs text-slate-500">
          <span>দ্রুত সেট করুন (সবাই):</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleQuickSetAll(num)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 border border-slate-200 rounded-lg text-xs font-bold transition"
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Member Meals List */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-2 space-y-2.5 pr-1">
          {activeMembers.map((mem) => (
            <div
              key={mem.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
            >
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[200px]">
                {mem.name}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={mealValues[mem.id] ?? ''}
                  onChange={(e) => handleMemberChange(mem.id, e.target.value)}
                  className="w-16 px-2.5 py-1 text-center text-sm font-bold bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-500/20"
                />
                <span className="text-xs text-slate-400">মিল</span>
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              id="save-batch-meals-btn"
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition"
            >
              <Check className="w-4 h-4" />
              <span>মিল সংরক্ষণ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

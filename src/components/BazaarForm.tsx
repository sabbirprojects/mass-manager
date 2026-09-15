import React, { useState } from 'react';
import { X, ShoppingBag, Calendar, User, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BazaarExpenseType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BazaarForm: React.FC<Props> = ({ isOpen, onClose }) => {
  const { members, activeMonth, addBazaarExpense } = useApp();

  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === activeMonth?.id);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [memberId, setMemberId] = useState(activeMembers[0]?.id || '');
  const [amount, setAmount] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<BazaarExpenseType>('groceries');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeMembers.length > 0 && !memberId) {
      setMemberId(activeMembers[0].id);
    }
  }, [activeMembers, memberId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.toString());
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক টাকার পরিমাণ দিন (0-এর বেশি হতে হবে)।');
      return;
    }

    if (!memberId) {
      setError('বাজারকারী সদস্য নির্বাচন করুন।');
      return;
    }

    const res = addBazaarExpense({
      memberId,
      date,
      description: description.trim(),
      amount: numAmount,
      type,
    });

    if (res.success) {
      setAmount('');
      setDescription('');
      onClose();
    } else {
      setError(res.error || 'বাজার খরচ সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div
      id="bazaar-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="bazaar-modal"
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <ShoppingBag className="w-5 h-5 text-sky-600" />
            <span>সাধারণ বাজার খরচ যোগ করুন</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ *</label>
              <div className="relative">
                <input
                  id="bazaar-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                টাকার পরিমাণ (৳) *
              </label>
              <input
                id="bazaar-amount-input"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বাজারকারী সদস্য *
            </label>
            <select
              id="bazaar-member-select"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            >
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিবরণ (Description)
            </label>
            <input
              id="bazaar-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. চাল, আলু, তেল ও পেঁয়াজ"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ক্যাটেগরি</label>
            <select
              id="bazaar-type-select"
              value={type}
              onChange={(e) => setType(e.target.value as BazaarExpenseType)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
            >
              <option value="groceries">মুদি পণ্য (Groceries / Rice / Oil)</option>
              <option value="fish_meat">মাছ ও মাংস (Fish & Meat)</option>
              <option value="vegetables">শাক-সবজি (Vegetables)</option>
              <option value="spices_oil">মশলা ও তেল (Spices)</option>
              <option value="other">অন্যান্য (Other)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
            >
              বাতিল
            </button>
            <button
              id="bazaar-submit-btn"
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl shadow-xs transition"
            >
              বাজার খরচ সংরক্ষণ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

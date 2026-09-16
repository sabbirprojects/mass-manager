import React, { useState } from 'react';
import { X, Wallet, Calendar, User, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLocalDateString } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DepositForm: React.FC<Props> = ({ isOpen, onClose }) => {
  const { members, activeMonth, addDeposit } = useApp();

  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === activeMonth?.id);
  const todayStr = getLocalDateString();

  const [date, setDate] = useState(todayStr);
  const [memberId, setMemberId] = useState(activeMembers[0]?.id || '');
  const [amount, setAmount] = useState<number | string>('');
  const [note, setNote] = useState('');
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
      setError('সঠিক জমার পরিমাণ দিন (0-এর বেশি)।');
      return;
    }

    if (!memberId) {
      setError('সদস্য নির্বাচন করুন।');
      return;
    }

    const res = addDeposit({
      memberId,
      date,
      amount: numAmount,
      note: note.trim() || undefined,
    });

    if (res.success) {
      setAmount('');
      setNote('');
      onClose();
    } else {
      setError(res.error || 'জমা সংরক্ষণ করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div
      id="deposit-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="deposit-modal"
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>জমা টাকা যোগ করুন (Member Deposit)</span>
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
              <input
                id="deposit-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                জমার পরিমাণ (৳) *
              </label>
              <input
                id="deposit-amount-input"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              সদস্যের নাম *
            </label>
            <select
              id="deposit-member-select"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
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
              নোট / মাধ্যম (ঐচ্ছিক)
            </label>
            <input
              id="deposit-note-input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. bKash / নগদ / ব্যাংক ট্রান্সফার"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
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
              id="deposit-submit-btn"
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-xs transition"
            >
              জমা সংরক্ষণ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

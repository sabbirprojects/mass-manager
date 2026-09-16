import React, { useState, useMemo } from 'react';
import { X, Layers, CheckSquare, Square, Calculator } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTaka, roundToTwo } from '../utils/calculations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalExpenseForm: React.FC<Props> = ({ isOpen, onClose }) => {
  const { members, activeMonth, addUniversalExpense } = useApp();

  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === activeMonth?.id);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [payerMemberId, setPayerMemberId] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(
    activeMembers.map((m) => m.id)
  );
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (activeMembers.length > 0 && selectedMemberIds.length === 0) {
      setSelectedMemberIds(activeMembers.map((m) => m.id));
    }
  }, [activeMembers]);

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const selectAll = () => setSelectedMemberIds(activeMembers.map((m) => m.id));
  const deselectAll = () => setSelectedMemberIds([]);

  // Live calculation preview
  const liveShare = useMemo(() => {
    const numAmt = parseFloat(amount.toString()) || 0;
    if (selectedMemberIds.length === 0) return 0;
    return roundToTwo(numAmt / selectedMemberIds.length);
  }, [amount, selectedMemberIds]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseFloat(amount.toString());
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('সঠিক টাকার পরিমাণ দিন (0-এর বেশি)।');
      return;
    }

    if (selectedMemberIds.length === 0) {
      setError('অন্তত একজন সদস্য নির্বাচন করুন যাদের মধ্যে এই খরচ ভাগ হবে।');
      return;
    }

    const res = addUniversalExpense({
      date,
      description: description.trim() || 'Universal Expense',
      amount: numAmount,
      applicableMemberIds: selectedMemberIds,
      payerMemberId: payerMemberId || null,
    });

    if (res.success) {
      setAmount('');
      setDescription('');
      setPayerMemberId('');
      onClose();
    } else {
      setError(res.error || 'ইউনিভার্সাল খরচ যোগ করতে সমস্যা হয়েছে।');
    }
  };

  return (
    <div
      id="universal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="universal-modal"
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <Layers className="w-5 h-5 text-indigo-600" />
            <span>ইউনিভার্সাল খরচ যোগ করুন (Universal Expense)</span>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          মেসের সার্বজনীন খরচ (যেমন: ওয়াইফাই, খালা বিল, পেপার বিল ইত্যাদি)। কোনো সদস্য পরিশোধ করলে তার নাম নির্বাচন করুন; পুরো টাকাটি সবার ব্যালেন্স থেকে সমভাগে কেটে ওই সদস্যের অ্যাকাউন্টে সরাসরি জমা (Credit) হবে।
        </p>

        {error && (
          <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3.5 flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">তারিখ *</label>
              <input
                id="universal-date-input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">মোট টাকা *</label>
              <input
                id="universal-amount-input"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              বিবরণ (Description) *
            </label>
            <input
              id="universal-desc-input"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. WiFi Bill, Cook Advance, Water Filter"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              পরিশোধকারী সদস্য (Paid By Member)
            </label>
            <select
              id="universal-payer-select"
              value={payerMemberId}
              onChange={(e) => setPayerMemberId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="">মেসের সাধারণ তহবিল (None / Mess Common Fund)</option>
              {activeMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (সদস্যের অ্যাকাউন্টে ক্রেডিট হবে)
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-500">
              {payerMemberId
                ? 'সদস্য নির্বাচিত: মোট টাকা সবার ব্যালেন্স থেকে সমভাগে কেটে ওই সদস্যের অ্যাকাউন্টে সরাসরি জমা (Credit) হবে।'
                : 'মেসের কমন ফান্ড থেকে দেওয়া হলে খালি রাখুন (সবার থেকে ভাগ কাটা হবে, কাউকে আলাদা ক্রেডিট দেওয়া হবে না)।'}
            </p>
          </div>

          {/* Member Multi-Select with Live Share Preview */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">
                খরচ বহনকারী সদস্য ({selectedMemberIds.length}/{activeMembers.length})
              </span>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-indigo-700 hover:underline font-semibold"
                >
                  সবাইকে নির্বাচন
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="text-slate-500 hover:underline"
                >
                  ক্লিয়ার
                </button>
              </div>
            </div>

            <div className="max-h-36 overflow-y-auto space-y-1.5 py-1">
              {activeMembers.map((m) => {
                const isSelected = selectedMemberIds.includes(m.id);
                return (
                  <div
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs transition border ${
                      isSelected
                        ? 'bg-white border-indigo-200 text-indigo-950 font-medium'
                        : 'bg-slate-50/70 border-slate-200/60 text-slate-400'
                    }`}
                  >
                    <span>{m.name}</span>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Live Share Preview Box */}
            <div className="pt-2 border-t border-indigo-200/60 flex items-center justify-between text-xs font-semibold text-indigo-950">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>মাথাপিছু ভাগ (Per Member):</span>
              </div>
              <span className="text-sm font-bold text-indigo-700">{formatTaka(liveShare)}</span>
            </div>
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
              id="universal-submit-btn"
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition"
            >
              ইউনিভার্সাল খরচ সংরক্ষণ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

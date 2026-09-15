import React, { useState } from 'react';
import { Lock, Unlock, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LockStatus: React.FC = () => {
  const { activeMonth, lockMonth, unlockMonth, openConfirm } = useApp();
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  if (!activeMonth) return null;

  const isLocked = activeMonth.status === 'locked';

  const handleLockClick = () => {
    openConfirm({
      title: 'মাস লক নিশ্চিতকরণ (Lock Month)',
      message: `আপনি কি নিশ্চিত যে '${activeMonth.name}' লক করতে চান? লক থাকা অবস্থায় কোনো মিল, বাজার বা জমা পরিবর্তন করা যাবে না।`,
      confirmLabel: 'লক করুন',
      isDestructive: true,
      onConfirm: () => {
        lockMonth(activeMonth.id, reason || 'মাসিক হিসাব সমাপ্ত ও নিশ্চিত করা হয়েছে');
        setShowReasonInput(false);
        setReason('');
      },
    });
  };

  const handleUnlockClick = () => {
    openConfirm({
      title: 'মাস আনলক নিশ্চিতকরণ (Unlock Month)',
      message: `আপনি কি '${activeMonth.name}' পুনরায় আনলক করতে চান? এর ফলে অনুমোদিত ব্যবহারকারীরা তথ্য এডিট করতে পারবেন।`,
      confirmLabel: 'আনলক করুন',
      isDestructive: false,
      onConfirm: () => {
        unlockMonth(activeMonth.id);
      },
    });
  };

  return (
    <div
      id="lock-status-widget"
      className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
        isLocked
          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl shrink-0 ${
            isLocked ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-600'
          }`}
        >
          {isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">
              {isLocked ? 'মাস লক করা আছে (Month Locked)' : 'মাস সক্রিয় ও সম্পাদনাযোগ্য (Active)'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isLocked ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {activeMonth.status.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isLocked
              ? `লক করেছেন: ${activeMonth.lockedBy || 'অনুমোদিত ব্যবহারকারী'} (${activeMonth.lockReason || 'হিসাব নিশ্চিত'})`
              : 'সব অনুমোদিত ব্যবহারকারী মিল, বাজার ও জমা তথ্য এন্ট্রি বা সংশোধন করতে পারবেন।'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center">
        {isLocked ? (
          <button
            id="unlock-month-btn"
            type="button"
            onClick={handleUnlockClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Unlock className="w-3.5 h-3.5 text-teal-600" />
            <span>আনলক করুন</span>
          </button>
        ) : (
          <button
            id="lock-month-btn"
            type="button"
            onClick={handleLockClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>মাস লক করুন</span>
          </button>
        )}
      </div>
    </div>
  );
};

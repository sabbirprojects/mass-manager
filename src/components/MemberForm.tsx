import React, { useState } from 'react';
import { X, UserPlus, Phone, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: {
    id: string;
    name: string;
    phone?: string;
    previousBalance: number;
    initialDeposit: number;
  };
}

export const MemberForm: React.FC<Props> = ({ isOpen, onClose, memberToEdit }) => {
  const { addMember, updateMember, activeMonth } = useApp();
  const [name, setName] = useState(memberToEdit?.name || '');
  const [phone, setPhone] = useState(memberToEdit?.phone || '');
  const [prevBal, setPrevBal] = useState<number | string>(
    memberToEdit ? memberToEdit.previousBalance : 0
  );
  const [initDeposit, setInitDeposit] = useState<number | string>(
    memberToEdit ? memberToEdit.initialDeposit : 0
  );
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (memberToEdit) {
      const res = updateMember(memberToEdit.id, {
        name,
        phone,
        previousBalance: Number(prevBal) || 0,
        initialDeposit: Number(initDeposit) || 0,
      });
      if (res.success) onClose();
      else setError(res.error || 'সদস্যের তথ্য আপডেট ব্যর্থ হয়েছে।');
    } else {
      const res = addMember({
        name,
        phone,
        previousBalance: Number(prevBal) || 0,
        initialDeposit: Number(initDeposit) || 0,
      });
      if (res.success) {
        setName('');
        setPhone('');
        setPrevBal(0);
        setInitDeposit(0);
        onClose();
      } else {
        setError(res.error || 'সদস্য যোগ করতে সমস্যা হয়েছে।');
      }
    }
  };

  return (
    <div
      id="member-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="member-modal"
        className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-base">
            <UserPlus className="w-5 h-5 text-teal-600" />
            <span>{memberToEdit ? 'সদস্য তথ্য সম্পাদনা' : 'নতুন সদস্য যোগ করুন'}</span>
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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              সদস্যের নাম (Member Name) *
            </label>
            <input
              id="member-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sabbir Hossain (সাব্বির)"
              required
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মোবাইল নম্বর (Phone - ঐচ্ছিক)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="member-phone-input"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                পূর্বের ব্যালেন্স (Prev Bal)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="member-prev-balance-input"
                  type="number"
                  step="any"
                  value={prevBal}
                  onChange={(e) => setPrevBal(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">পাওনা হলে +, বকেয়া হলে -</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রাথমিক জমা (Deposit)
              </label>
              <div className="relative">
                <Wallet className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="member-init-deposit-input"
                  type="number"
                  step="any"
                  value={initDeposit}
                  onChange={(e) => setInitDeposit(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">মাসের শুরুতে জমা</span>
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
              id="member-form-submit-btn"
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 active:bg-teal-800 rounded-xl shadow-xs transition"
            >
              {memberToEdit ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

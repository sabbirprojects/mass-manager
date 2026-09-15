import React, { useState } from 'react';
import { UserPlus, ShoppingCart, Layers, PlusCircle, CalendarDays, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MemberForm } from './MemberForm';
import { BazaarForm } from './BazaarForm';
import { UniversalExpenseForm } from './UniversalExpenseForm';
import { DepositForm } from './DepositForm';
import { MealEntry } from './MealEntry';

export const QuickActions: React.FC = () => {
  const { activeMonth, setActiveTab } = useApp();
  const [activeModal, setActiveModal] = useState<
    'member' | 'bazaar' | 'universal' | 'deposit' | 'meal' | null
  >(null);

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="quick-actions-bar" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          কুইক অ্যাকশন (Quick Actions)
        </span>
        {isLocked && (
          <span className="text-[11px] text-amber-600 font-medium">
            মাস লক করা (এন্ট্রি নিষ্ক্রিয়)
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {/* Add Member */}
        <button
          id="quick-add-member-btn"
          type="button"
          disabled={isLocked}
          onClick={() => setActiveModal('member')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200/80 hover:border-teal-300 text-slate-700 hover:text-teal-800 transition shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          <UserPlus className="w-4 h-4 text-teal-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">সদস্য যোগ</span>
        </button>

        {/* Add Daily Meal */}
        <button
          id="quick-add-meal-btn"
          type="button"
          disabled={isLocked}
          onClick={() => setActiveModal('meal')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 text-slate-700 hover:text-amber-800 transition shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          <CalendarDays className="w-4 h-4 text-amber-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">মিল এন্ট্রি</span>
        </button>

        {/* Add Bazaar */}
        <button
          id="quick-add-bazaar-btn"
          type="button"
          disabled={isLocked}
          onClick={() => setActiveModal('bazaar')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-sky-50/60 border border-slate-200/80 hover:border-sky-300 text-slate-700 hover:text-sky-800 transition shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          <ShoppingCart className="w-4 h-4 text-sky-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">বাজার খরচ</span>
        </button>

        {/* Add Universal Expense */}
        <button
          id="quick-add-universal-btn"
          type="button"
          disabled={isLocked}
          onClick={() => setActiveModal('universal')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-300 text-slate-700 hover:text-indigo-800 transition shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          <Layers className="w-4 h-4 text-indigo-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">ইউনিভার্সাল</span>
        </button>

        {/* Add Deposit */}
        <button
          id="quick-add-deposit-btn"
          type="button"
          disabled={isLocked}
          onClick={() => setActiveModal('deposit')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 transition shadow-xs disabled:opacity-40 disabled:pointer-events-none"
        >
          <PlusCircle className="w-4 h-4 text-emerald-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">জমা টাকা</span>
        </button>

        {/* Generate Report */}
        <button
          id="quick-reports-btn"
          type="button"
          onClick={() => setActiveTab('reports')}
          className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700 hover:text-slate-900 transition shadow-xs"
        >
          <FileText className="w-4 h-4 text-slate-600 mb-1" />
          <span className="text-[11px] font-semibold text-center leading-tight">রিপোর্ট</span>
        </button>
      </div>

      {/* Embedded Modals */}
      <MemberForm isOpen={activeModal === 'member'} onClose={() => setActiveModal(null)} />
      <BazaarForm isOpen={activeModal === 'bazaar'} onClose={() => setActiveModal(null)} />
      <UniversalExpenseForm
        isOpen={activeModal === 'universal'}
        onClose={() => setActiveModal(null)}
      />
      <DepositForm isOpen={activeModal === 'deposit'} onClose={() => setActiveModal(null)} />
      <MealEntry isOpen={activeModal === 'meal'} onClose={() => setActiveModal(null)} />
    </div>
  );
};

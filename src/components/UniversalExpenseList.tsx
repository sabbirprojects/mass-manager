import React, { useState, useMemo } from 'react';
import { Layers, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UniversalExpenseItem } from './UniversalExpenseItem';
import { UniversalExpenseForm } from './UniversalExpenseForm';
import { SearchInput } from './SearchInput';
import { formatTaka } from '../utils/calculations';

export const UniversalExpenseList: React.FC = () => {
  const { universalExpenses, activeMonth, deleteUniversalExpense, openConfirm } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentMonthExpenses = useMemo(() => {
    if (!activeMonth) return [];
    return universalExpenses.filter((u) => u.monthId === activeMonth.id);
  }, [universalExpenses, activeMonth]);

  const filteredExpenses = useMemo(() => {
    return currentMonthExpenses.filter((u) => {
      return (
        u.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.date.includes(searchTerm)
      );
    });
  }, [currentMonthExpenses, searchTerm]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  }, [filteredExpenses]);

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'ইউনিভার্সাল খরচ মোছা নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত যে এই ইউনিভার্সাল খরচটি মুছে ফেলতে চান?',
      confirmLabel: 'মুছে ফেলুন',
      isDestructive: true,
      onConfirm: () => {
        deleteUniversalExpense(id);
      },
    });
  };

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="universal-list-container" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">ইউনিভার্সাল খরচ (Universal Expenses)</h3>
            <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 font-bold rounded-full">
              মোট: {formatTaka(totalAmount)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            ওয়াইফাই, গ্যাস, পানি, খালা বিল ইত্যাদি নির্ধারিত সদস্যদের মধ্যে সমানভাবে ভাগ হয়।
          </p>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>ইউনিভার্সাল খরচ যোগ</span>
        </button>
      </div>

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="খরচের বিবরণ বা তারিখ দিয়ে অনুসন্ধান করুন..."
      />

      {filteredExpenses.length > 0 ? (
        <div className="grid gap-2">
          {filteredExpenses.map((exp) => (
            <UniversalExpenseItem
              key={exp.id}
              expense={exp}
              isLocked={isLocked}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <Layers className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">কোনো ইউনিভার্সাল খরচ নেই।</p>
          {!searchTerm && !isLocked && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>প্রথম ইউনিভার্সাল খরচ যোগ করুন</span>
            </button>
          )}
        </div>
      )}

      <UniversalExpenseForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

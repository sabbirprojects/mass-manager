import React, { useState, useMemo } from 'react';
import { ShoppingBag, Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BazaarItem } from './BazaarItem';
import { BazaarForm } from './BazaarForm';
import { SearchInput } from './SearchInput';
import { formatTaka } from '../utils/calculations';

export const BazaarList: React.FC = () => {
  const { bazaarExpenses, activeMonth, members, deleteBazaarExpense, openConfirm } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeMembers = useMemo(() => {
    if (!activeMonth) return [];
    return members.filter((m) => !m.isRemoved && m.monthId === activeMonth.id);
  }, [members, activeMonth]);

  const memberMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      map[m.id] = m.name;
    }
    return map;
  }, [members]);

  const currentMonthExpenses = useMemo(() => {
    if (!activeMonth) return [];
    return bazaarExpenses.filter((b) => b.monthId === activeMonth.id);
  }, [bazaarExpenses, activeMonth]);

  const filteredExpenses = useMemo(() => {
    return currentMonthExpenses.filter((b) => {
      const matchSearch =
        b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.date.includes(searchTerm) ||
        (memberMap[b.memberId] && memberMap[b.memberId].toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (selectedMember !== 'all' && b.memberId !== selectedMember) return false;

      return true;
    });
  }, [currentMonthExpenses, searchTerm, selectedMember, memberMap]);

  const totalGroceries = useMemo(() => {
    return filteredExpenses.reduce((sum, b) => sum + Math.abs(Number(b.amount) || 0), 0);
  }, [filteredExpenses]);

  const sharedFundsTotal = useMemo(() => {
    return filteredExpenses
      .filter((b) => Number(b.amount) < 0)
      .reduce((sum, b) => sum + Math.abs(Number(b.amount) || 0), 0);
  }, [filteredExpenses]);

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'বাজার খরচ মোছা নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত যে এই বাজার খরচটি মুছে ফেলতে চান?',
      confirmLabel: 'মুছে ফেলুন',
      isDestructive: true,
      onConfirm: () => {
        deleteBazaarExpense(id);
      },
    });
  };

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="bazaar-list-container" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-bold text-slate-900">সাধারণ বাজার খাতা (General Bazaar)</h3>
            <span className="text-xs px-2 py-0.5 bg-sky-50 text-sky-700 font-bold rounded-full">
              মোট বাজার: {formatTaka(totalGroceries)}
            </span>
            {sharedFundsTotal > 0 && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-800 font-bold rounded-full border border-amber-200">
                শেয়ার্ড ফান্ড কর্তন: {formatTaka(sharedFundsTotal)}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            বাজারের খরচ মিল রেটের অংশ হিসেবে সব মিলের মধ্যে সমানভাবে ভাগ হবে।
          </p>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>বাজার খরচ যোগ</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="বিবরণ, সদস্য বা তারিখ দিয়ে খুঁজুন..."
        />
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
        >
          <option value="all">সকল বাজারকারী সদস্য ({activeMembers.length})</option>
          {activeMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Items */}
      {filteredExpenses.length > 0 ? (
        <div className="grid gap-2">
          {filteredExpenses.map((exp) => (
            <BazaarItem
              key={exp.id}
              expense={exp}
              memberName={memberMap[exp.memberId] || 'অজানা সদস্য'}
              isLocked={isLocked}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <ShoppingBag className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">কোনো বাজার খরচ পাওয়া যায়নি।</p>
          {!searchTerm && !isLocked && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>প্রথম বাজার খরচ যোগ করুন</span>
            </button>
          )}
        </div>
      )}

      <BazaarForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

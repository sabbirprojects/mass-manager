import React, { useState, useMemo } from 'react';
import { Wallet, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DepositItem } from './DepositItem';
import { DepositForm } from './DepositForm';
import { SearchInput } from './SearchInput';
import { formatTaka } from '../utils/calculations';

export const DepositList: React.FC = () => {
  const { deposits, activeMonth, members, deleteDeposit, openConfirm } = useApp();
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

  const currentMonthDeposits = useMemo(() => {
    if (!activeMonth) return [];
    return deposits.filter((d) => d.monthId === activeMonth.id);
  }, [deposits, activeMonth]);

  const filteredDeposits = useMemo(() => {
    return currentMonthDeposits.filter((d) => {
      const memName = memberMap[d.memberId] || '';
      const matchSearch =
        memName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.date.includes(searchTerm) ||
        (d.note && d.note.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchSearch) return false;
      if (selectedMember !== 'all' && d.memberId !== selectedMember) return false;

      return true;
    });
  }, [currentMonthDeposits, searchTerm, selectedMember, memberMap]);

  const totalAmount = useMemo(() => {
    return filteredDeposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [filteredDeposits]);

  const handleDelete = (id: string) => {
    openConfirm({
      title: 'জমা রেকর্ড মোছা নিশ্চিতকরণ',
      message: 'আপনি কি নিশ্চিত যে এই জমা এন্ট্রিটি মুছে ফেলতে চান? এটি সদস্যের ব্যালেন্সকে প্রভাবিত করবে।',
      confirmLabel: 'মুছে ফেলুন',
      isDestructive: true,
      onConfirm: () => {
        deleteDeposit(id);
      },
    });
  };

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="deposits-list-container" className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900">সদস্যদের জমা খাতা (Deposits)</h3>
            <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full">
              মোট: {formatTaka(totalAmount)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            নগদ বা ডিজিটালভাবে প্রাপ্ত জমা টাকা যা সদস্যের ব্যালেন্স বাড়ায়।
          </p>
        </div>

        <button
          type="button"
          disabled={isLocked}
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
          <span>জমা টাকা যোগ</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="সদস্যের নাম, তারিখ বা নোট দিয়ে খুঁজুন..."
        />
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
        >
          <option value="all">সকল সদস্য ({activeMembers.length})</option>
          {activeMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {filteredDeposits.length > 0 ? (
        <div className="grid gap-2">
          {filteredDeposits.map((dep) => (
            <DepositItem
              key={dep.id}
              deposit={dep}
              memberName={memberMap[dep.memberId] || 'অজানা সদস্য'}
              isLocked={isLocked}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <Wallet className="w-9 h-9 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">কোনো জমা রেকর্ড পাওয়া যায়নি।</p>
          {!searchTerm && !isLocked && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>প্রথম জমা এন্ট্রি যোগ করুন</span>
            </button>
          )}
        </div>
      )}

      <DepositForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

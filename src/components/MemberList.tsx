import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import { MemberCard } from './MemberCard';
import { MemberForm } from './MemberForm';
import { SearchInput } from './SearchInput';
import { FilterBar } from './FilterBar';

export const MemberList: React.FC = () => {
  const { members, activeMonth, financialSummary, removeMember, openConfirm } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);

  const activeMembers = useMemo(() => {
    if (!activeMonth) return [];
    return members.filter((m) => !m.isRemoved && m.monthId === activeMonth.id);
  }, [members, activeMonth]);

  const filteredMembers = useMemo(() => {
    return activeMembers.filter((m) => {
      // Search match
      const matchSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.phone && m.phone.includes(searchTerm));

      if (!matchSearch) return false;

      // Status filter
      if (statusFilter === 'all') return true;
      const memSummary = financialSummary?.memberSummaries[m.id];
      if (!memSummary) return true;

      return memSummary.balanceStatus === statusFilter;
    });
  }, [activeMembers, searchTerm, statusFilter, financialSummary]);

  const counts = useMemo(() => {
    let rec = 0;
    let pay = 0;
    let set = 0;
    if (financialSummary) {
      for (const m of activeMembers) {
        const st = financialSummary.memberSummaries[m.id]?.balanceStatus;
        if (st === 'receivable') rec++;
        else if (st === 'payable') pay++;
        else set++;
      }
    }
    return { all: activeMembers.length, rec, pay, set };
  }, [activeMembers, financialSummary]);

  const filterOptions = [
    { id: 'all', label: 'সকল সদস্য', count: counts.all },
    { id: 'receivable', label: 'ফেরত পাবে (+)', count: counts.rec },
    { id: 'payable', label: 'বকেয়া (-)', count: counts.pay },
    { id: 'settled', label: 'সমান (০)', count: counts.set },
  ];

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setIsFormOpen(true);
  };

  const handleRemove = (id: string, name: string) => {
    openConfirm({
      title: 'সদস্য রিমুভ নিশ্চিতকরণ',
      message: `আপনি কি '${name}' কে এই মাস থেকে রিমুভ করতে চান?`,
      confirmLabel: 'রিমুভ করুন',
      isDestructive: true,
      onConfirm: () => {
        removeMember(id);
      },
    });
  };

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="member-list-section" className="space-y-4">
      {/* Header and Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <span>সদস্য তালিকা ও ব্যালেন্স ({activeMembers.length} জন)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রত্যেক সদস্যের মিল, খরচ, জমা ও চূড়ান্ত ব্যালেন্স
          </p>
        </div>

        <button
          id="add-member-top-btn"
          type="button"
          disabled={isLocked}
          onClick={() => {
            setEditingMember(undefined);
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-40"
        >
          <UserPlus className="w-4 h-4" />
          <span>সদস্য যোগ</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="সদস্যের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
        />
        <FilterBar
          options={filterOptions}
          selectedId={statusFilter}
          onSelect={setStatusFilter}
        />
      </div>

      {/* Member Cards Grid / List */}
      {filteredMembers.length > 0 ? (
        <div className="grid gap-2.5">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              summary={financialSummary?.memberSummaries[member.id]}
              onEdit={handleEdit}
              onRemove={handleRemove}
              isLocked={isLocked}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">কোনো সদস্য খুঁজে পাওয়া যায়নি</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? 'অনুসন্ধানের সাথে কোনো সদস্য মিলেনি।'
              : 'এখনো কোনো সদস্য যোগ করা হয়নি। ওপরের বাটন চেপে নতুন সদস্য যোগ করুন।'}
          </p>
          {!searchTerm && !isLocked && (
            <button
              type="button"
              onClick={() => {
                setEditingMember(undefined);
                setIsFormOpen(true);
              }}
              className="mt-3.5 inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>প্রথম সদস্য যোগ করুন</span>
            </button>
          )}
        </div>
      )}

      {/* Member Form Modal */}
      <MemberForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMember(undefined);
        }}
        memberToEdit={editingMember}
      />
    </div>
  );
};

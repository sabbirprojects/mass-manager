import React from 'react';
import { Layers, Trash2, Calendar, Users, Calculator, UserCheck } from 'lucide-react';
import { UniversalExpense } from '../types';
import { formatTaka } from '../utils/calculations';
import { useApp } from '../context/AppContext';

interface Props {
  expense: UniversalExpense;
  isLocked: boolean;
  onDelete: (id: string) => void;
}

export const UniversalExpenseItem: React.FC<Props> = ({ expense, isLocked, onDelete }) => {
  const { members } = useApp();
  const payer = expense.payerMemberId ? members.find((m) => m.id === expense.payerMemberId) : null;

  return (
    <div
      id={`universal-item-${expense.id}`}
      className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0 border border-indigo-100">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-slate-900 truncate">{expense.description}</h4>
            {payer && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <UserCheck className="w-3 h-3" />
                পরিশোধ: {payer.name} (+{formatTaka(expense.amount)})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-indigo-700">
              <Users className="w-3 h-3" />
              {expense.applicableMemberIds.length} জন সদস্যের ভাগ
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {expense.date}
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-700">
              মাথাপিছু {formatTaka(expense.perMemberShare)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-base font-bold text-indigo-900">{formatTaka(expense.amount)}</span>
          <span className="block text-[10px] text-slate-400">
            {payer ? `ক্রেডিট: ${payer.name}` : 'কমন ফান্ড'}
          </span>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={() => onDelete(expense.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="খরচ মুছুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

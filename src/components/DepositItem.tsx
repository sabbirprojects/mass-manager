import React from 'react';
import { Wallet, Trash2, Calendar, User, FileText } from 'lucide-react';
import { Deposit } from '../types';
import { formatTaka } from '../utils/calculations';

interface Props {
  deposit: Deposit;
  memberName: string;
  isLocked: boolean;
  onDelete: (id: string) => void;
}

export const DepositItem: React.FC<Props> = ({ deposit, memberName, isLocked, onDelete }) => {
  return (
    <div
      id={`deposit-item-${deposit.id}`}
      className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
          <Wallet className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate">{memberName}</h4>
            {deposit.note && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 truncate max-w-[150px]">
                {deposit.note}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              {deposit.date}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              (জমা নথিভুক্তকারী: @{deposit.createdBy})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-base font-bold text-emerald-700">{formatTaka(deposit.amount)}</span>
          <span className="block text-[10px] text-slate-400">জমা</span>
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={() => onDelete(deposit.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
            title="জমা রেকর্ড মুছুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

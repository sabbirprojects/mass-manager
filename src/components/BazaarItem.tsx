import React from 'react';
import { ShoppingBag, Trash2, Calendar, User, Tag } from 'lucide-react';
import { BazaarExpense } from '../types';
import { formatTaka } from '../utils/calculations';
import { useApp } from '../context/AppContext';

interface Props {
  expense: BazaarExpense;
  memberName: string;
  isLocked: boolean;
  onDelete: (id: string) => void;
}

export const BazaarItem: React.FC<Props> = ({ expense, memberName, isLocked, onDelete }) => {
  const getCategoryBadge = (t: string) => {
    switch (t) {
      case 'fish_meat':
        return { label: 'মাছ-মাংস', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'vegetables':
        return { label: 'শাক-সবজি', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'spices_oil':
        return { label: 'মশলা-তেল', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'groceries':
        return { label: 'মুদি বাজার', color: 'bg-sky-50 text-sky-700 border-sky-200' };
      default:
        return { label: 'অন্যান্য', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const badge = getCategoryBadge(expense.type);

  return (
    <div
      id={`bazaar-item-${expense.id}`}
      className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 border border-sky-100">
          <ShoppingBag className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 truncate">{expense.description}</h4>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badge.color}`}
            >
              {badge.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-slate-400" />
              <b>{memberName}</b>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {expense.date}
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              (@{expense.createdBy})
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <span className="text-base font-bold text-slate-900">{formatTaka(expense.amount)}</span>
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

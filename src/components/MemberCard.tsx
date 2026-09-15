import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit2, Trash2, Phone, Utensils, ShoppingBag, Layers, Wallet } from 'lucide-react';
import { Member, MemberFinancialSummary } from '../types';
import { formatMeal, formatTaka } from '../utils/calculations';
import { useApp } from '../context/AppContext';

interface Props {
  member: Member;
  summary?: MemberFinancialSummary;
  onEdit: (member: Member) => void;
  onRemove: (id: string, name: string) => void;
  isLocked?: boolean;
}

export const MemberCard: React.FC<Props> = ({
  member,
  summary,
  onEdit,
  onRemove,
  isLocked = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const finalBal = summary?.finalBalance || 0;
  const isReceivable = finalBal > 0.009;
  const isPayable = finalBal < -0.009;

  return (
    <div
      id={`member-card-${member.id}`}
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-slate-300 transition overflow-hidden"
    >
      {/* Primary Top Row */}
      <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-bold text-sm flex items-center justify-center shrink-0 border border-teal-100">
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">{member.name}</h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>মিল: <b>{formatMeal(summary?.totalMeal || 0)}</b></span>
              <span>•</span>
              <span>জমা: <b>{formatTaka(summary?.totalDeposit || 0)}</b></span>
            </div>
          </div>
        </div>

        {/* Right side balance & toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div
              className={`text-sm font-bold ${
                isReceivable ? 'text-emerald-600' : isPayable ? 'text-rose-600' : 'text-slate-700'
              }`}
            >
              {formatTaka(finalBal)}
            </div>
            <span
              className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                isReceivable
                  ? 'bg-emerald-50 text-emerald-700'
                  : isPayable
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isReceivable ? 'ফেরত পাবে' : isPayable ? 'বকেয়া' : 'সমান'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle details"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Breakdown Accordion */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-medium">পূর্বের ব্যালেন্স</span>
              <span className="font-semibold text-slate-800">
                {formatTaka(summary?.previousBalance || 0)}
              </span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-medium">মিলের খরচ</span>
              <span className="font-semibold text-slate-800">
                {formatTaka(summary?.mealCost || 0)}
              </span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-medium">ব্যক্তিগত বাজার খরচ</span>
              <span className="font-semibold text-slate-800">
                {formatTaka(summary?.personalBazaarCost || 0)}
              </span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-medium">ইউনিভার্সাল খরচ ভাগ</span>
              <span className="font-semibold text-slate-800">
                {formatTaka(summary?.universalCostShare || 0)}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
            <div>
              সর্বমোট খরচ: <b className="text-slate-900">{formatTaka(summary?.totalCost || 0)}</b>
            </div>
            {member.phone && (
              <div className="flex items-center gap-1 text-slate-500">
                <Phone className="w-3 h-3" />
                <span>{member.phone}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          {!isLocked && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
              <button
                type="button"
                onClick={() => onEdit(member)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition"
              >
                <Edit2 className="w-3 h-3" />
                <span>সম্পাদনা</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(member.id, member.name)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>রিমুভ</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

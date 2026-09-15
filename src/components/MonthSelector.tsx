import React, { useState } from 'react';
import { Calendar, ChevronDown, Plus, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthCreateForm } from './MonthCreateForm';

export const MonthSelector: React.FC = () => {
  const { months, activeMonth, setActiveMonthId } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="relative">
      <button
        id="month-selector-dropdown-btn"
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 shadow-xs transition"
      >
        <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
        <span className="truncate max-w-[140px] sm:max-w-[190px]">
          {activeMonth?.name || 'মাস নির্বাচন করুন'}
        </span>
        {activeMonth?.status === 'locked' && (
          <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" title="লক করা মাস" />
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div
            id="month-selector-dropdown-menu"
            className="absolute left-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
          >
            <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              মাস নির্বাচন করুন
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {months.map((m) => {
                const isCurrent = m.id === activeMonth?.id;
                return (
                  <button
                    key={m.id}
                    id={`month-option-${m.id}`}
                    type="button"
                    onClick={() => {
                      setActiveMonthId(m.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-left text-xs transition ${
                      isCurrent
                        ? 'bg-teal-50 text-teal-800 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {m.status === 'locked' && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700 font-medium">
                          <Lock className="w-2.5 h-2.5" /> লক
                        </span>
                      )}
                      {m.calculationMode === 'fixed' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600">
                          ফিক্সড
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-1.5 border-t border-slate-100">
              <button
                id="open-create-month-btn"
                type="button"
                onClick={() => {
                  setIsDropdownOpen(false);
                  setIsCreateOpen(true);
                }}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-teal-700 hover:bg-teal-50 rounded-xl transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>নতুন মাস তৈরি করুন</span>
              </button>
            </div>
          </div>
        </>
      )}

      <MonthCreateForm isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
};

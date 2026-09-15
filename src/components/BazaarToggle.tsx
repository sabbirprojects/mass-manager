import React from 'react';
import { ShoppingCart, Layers, Wallet } from 'lucide-react';

export type BazaarSubTab = 'general' | 'universal' | 'deposits';

interface Props {
  activeTab: BazaarSubTab;
  onChange: (tab: BazaarSubTab) => void;
  counts?: { general: number; universal: number; deposits: number };
}

export const BazaarToggle: React.FC<Props> = ({ activeTab, onChange, counts }) => {
  return (
    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
      <button
        id="toggle-general-bazaar"
        type="button"
        onClick={() => onChange('general')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
          activeTab === 'general'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <ShoppingCart className="w-3.5 h-3.5 text-sky-600" />
        <span>সাধারণ বাজার</span>
        {counts && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {counts.general}
          </span>
        )}
      </button>

      <button
        id="toggle-universal-expense"
        type="button"
        onClick={() => onChange('universal')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
          activeTab === 'universal'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Layers className="w-3.5 h-3.5 text-indigo-600" />
        <span>ইউনিভার্সাল খরচ</span>
        {counts && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {counts.universal}
          </span>
        )}
      </button>

      <button
        id="toggle-deposits"
        type="button"
        onClick={() => onChange('deposits')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition ${
          activeTab === 'deposits'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
        <span>জমা টাকা</span>
        {counts && (
          <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700">
            {counts.deposits}
          </span>
        )}
      </button>
    </div>
  );
};

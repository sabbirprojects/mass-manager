import React from 'react';
import { Utensils, TrendingUp, ShoppingBag, Layers, Wallet, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMeal, formatTaka } from '../utils/calculations';

export const MonthSummary: React.FC = () => {
  const { financialSummary, activeMonth } = useApp();

  if (!financialSummary || !activeMonth) return null;

  return (
    <div id="month-summary-section" className="space-y-3">
      {/* Top 2 Primary Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Meal Rate Card */}
        <div
          id="stat-meal-rate"
          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">মিল রেট (Meal Rate)</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {formatTaka(financialSummary.mealRate)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {activeMonth.calculationMode === 'auto' ? 'স্বয়ংক্রিয় (Auto)' : 'ফিক্সড (Fixed)'}
            </p>
          </div>
        </div>

        {/* Total Meals Card */}
        <div
          id="stat-total-meals"
          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">মোট মিল (Total Meals)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {formatMeal(financialSummary.totalMeals)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {financialSummary.totalMembers} জন সক্রিয় সদস্য
            </p>
          </div>
        </div>

        {/* Total General Bazaar Card */}
        <div
          id="stat-total-bazaar"
          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">সাধারণ বাজার (Bazaar)</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              {formatTaka(financialSummary.totalGeneralBazaar)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">মিলের মূল খরচ</p>
          </div>
        </div>

        {/* Total Deposits Card */}
        <div
          id="stat-total-deposits"
          className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold">মোট জমা (Deposits)</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">
              {formatTaka(financialSummary.totalDeposits)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">সদস্যদের প্রদত্ত জমা</p>
          </div>
        </div>
      </div>

      {/* Secondary Financial Metrics Strip */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          <div className="border-r border-slate-800 pr-2">
            <span className="text-[11px] text-slate-400 block font-medium">ইউনিভার্সাল খরচ</span>
            <span className="text-sm font-bold text-slate-100">
              {formatTaka(financialSummary.totalUniversalExpense)}
            </span>
          </div>
          <div className="sm:border-r border-slate-800 pr-2">
            <span className="text-[11px] text-slate-400 block font-medium">সর্বমোট খরচ (Total Cost)</span>
            <span className="text-sm font-bold text-slate-100">
              {formatTaka(financialSummary.totalCost)}
            </span>
          </div>
          <div className="border-r border-slate-800 pr-2">
            <span className="text-[11px] text-emerald-400 block font-medium flex items-center justify-center sm:justify-start gap-1">
              <ArrowDownRight className="w-3 h-3" /> ফেরত পাবে (Surplus)
            </span>
            <span className="text-sm font-bold text-emerald-300">
              {formatTaka(financialSummary.totalReceivable)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-rose-400 block font-medium flex items-center justify-center sm:justify-start gap-1">
              <ArrowUpRight className="w-3 h-3" /> বকেয়া দিতে হবে (Due)
            </span>
            <span className="text-sm font-bold text-rose-300">
              {formatTaka(financialSummary.totalPayable)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

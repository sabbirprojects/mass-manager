import React from 'react';
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMeal, formatTaka } from '../utils/calculations';

export const BalanceSummary: React.FC = () => {
  const { financialSummary, activeMonth } = useApp();

  if (!financialSummary || !activeMonth) return null;

  const summaries = Object.values(financialSummary.memberSummaries);

  return (
    <div id="balance-summary-container" className="space-y-4">
      {/* High-level status banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-4 h-4 text-teal-600" />
            <span>মাসিক সামগ্রিক ব্যালেন্স শিট ({activeMonth.name})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            সূত্র: পূর্বের ব্যালেন্স + মোট জমা + বাজার খরচ − সর্বমোট খরচ = চূড়ান্ত ব্যালেন্স
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            <span>মোট সারপ্লাস (ফেরত পাবে): {formatTaka(financialSummary.totalReceivable)}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>মোট বকেয়া (দিতে হবে): {formatTaka(financialSummary.totalPayable)}</span>
          </div>
        </div>
      </div>

      {/* Detailed Full Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                <th className="py-3 px-3.5 sticky left-0 bg-slate-50 z-10">সদস্যের নাম</th>
                <th className="py-3 px-3 text-right">পূর্বের ব্যালেন্স</th>
                <th className="py-3 px-3 text-center">মিল</th>
                <th className="py-3 px-3 text-right">মিল খরচ</th>
                <th className="py-3 px-3 text-right">ইউনিভার্সাল ভাগ</th>
                <th className="py-3 px-3 text-right font-bold text-slate-900">সর্বমোট খরচ</th>
                <th className="py-3 px-3 text-right font-bold text-sky-700">বাজার খরচ (+)</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-700">মোট জমা (+)</th>
                <th className="py-3 px-3.5 text-right font-bold">চূড়ান্ত ব্যালেন্স</th>
                <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {summaries.map((m) => {
                const isReceivable = m.balanceStatus === 'receivable';
                const isPayable = m.balanceStatus === 'payable';

                return (
                  <tr key={m.memberId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-3.5 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/70 z-10 truncate max-w-[150px]">
                      {m.name}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-600">
                      {formatTaka(m.previousBalance)}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-800">
                      {formatMeal(m.totalMeal)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium">
                      {formatTaka(m.mealCost)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-700 font-medium">
                      {formatTaka(m.universalCostShare)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">
                      {formatTaka(m.totalCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-sky-700">
                      {formatTaka(m.personalBazaarCost)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-700">
                      {formatTaka(m.totalDeposit)}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-bold text-sm ${
                        isReceivable
                          ? 'text-emerald-600'
                          : isPayable
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {formatTaka(m.finalBalance)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isReceivable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isPayable
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isReceivable ? 'ফেরত পাবে (+)' : isPayable ? 'বকেয়া (-)' : 'সমান (০)'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-200 text-xs">
                <td className="py-3 px-3.5 sticky left-0 bg-slate-100">মোট সর্বজনীন</td>
                <td className="py-3 px-3 text-right">
                  {formatTaka(summaries.reduce((acc, curr) => acc + curr.previousBalance, 0))}
                </td>
                <td className="py-3 px-3 text-center">{formatMeal(financialSummary.totalMeals)}</td>
                <td className="py-3 px-3 text-right">
                  {formatTaka(
                    summaries.reduce((acc, curr) => acc + curr.mealCost, 0)
                  )}
                </td>
                <td className="py-3 px-3 text-right">
                  {formatTaka(financialSummary.totalUniversalExpense)}
                </td>
                <td className="py-3 px-3 text-right">{formatTaka(financialSummary.totalCost)}</td>
                <td className="py-3 px-3 text-right text-sky-700 font-bold">
                  {formatTaka(financialSummary.totalGeneralBazaar)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-700 font-bold">
                  {formatTaka(financialSummary.totalDeposits)}
                </td>
                <td className="py-3 px-3.5 text-right font-extrabold text-teal-900">
                  {formatTaka(summaries.reduce((acc, curr) => acc + curr.finalBalance, 0))}
                </td>
                <td className="py-3 px-3 text-center text-[11px] text-slate-500">সমাপ্তি</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

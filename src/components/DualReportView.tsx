import React from 'react';
import {
  BazaarExpense,
  Deposit,
  Member,
  MemberFinancialSummary,
  Month,
  MonthFinancialSummary,
  UniversalExpense,
} from '../types';
import { formatMeal, formatTaka, roundToTwo, getBazaarTypeLabel } from '../utils/calculations';

interface DualReportViewProps {
  month: Month;
  summary: MonthFinancialSummary;
  members: Member[];
  bazaarExpenses: BazaarExpense[];
  universalExpenses: UniversalExpense[];
  deposits: Deposit[];
  generatedBy: string;
}

export const DualReportView = React.forwardRef<HTMLDivElement, DualReportViewProps>(
  (
    { month, summary, members, bazaarExpenses, universalExpenses, deposits, generatedBy },
    ref
  ) => {
    const dateStr = new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const memberNameMap: Record<string, string> = {};
    for (const m of members) {
      memberNameMap[m.id] = m.name;
    }

    const memberSummaries: MemberFinancialSummary[] = Object.values(summary.memberSummaries);

    const totalBazaarAmt = bazaarExpenses.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalUniversalAmt = universalExpenses.reduce(
      (sum, u) => sum + (Number(u.amount) || 0),
      0
    );
    const totalDepositAmt = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    return (
      <div
        ref={ref}
        id="dual-report-document-root"
        className="bg-white text-slate-900 p-6 sm:p-8 max-w-4xl mx-auto text-xs leading-normal border border-slate-200 shadow-sm rounded-xl"
        style={{
          minWidth: '768px',
          fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
        }}
      >
        {/* ========================================================= */}
        {/* REPORT 1: MONTHLY FINANCIAL SUMMARY & MEMBER BALANCES     */}
        {/* ========================================================= */}
        <section
          id="report-1-monthly-section"
          className="mb-10 pb-6 border-b border-slate-200 bg-white"
          style={{
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
          }}
        >
          {/* Header */}
          <div className="border-b-2 border-teal-700 pb-3 mb-4 flex justify-between items-end">
            <div>
              <div className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                স্মার্ট মিল ম্যানেজার — অফিশিয়াল অডিট রিপোর্ট
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-0.5">
                মাসিক হিসাব ও সদস্য ব্যালেন্স বিবরণী (Report 1)
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                মাস: <strong className="text-slate-900">{month.name}</strong> | সময়কাল:{' '}
                {month.startDate} থেকে {month.endDate} | স্ট্যাটাস:{' '}
                <span className="font-bold">
                  {month.status === 'locked' ? 'লকড (চূড়ান্ত হিসাব)' : 'চলমান (সক্রিয়)'}
                </span>
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              <div>প্রিন্ট: {dateStr}</div>
              <div>প্রস্তুতকারক: {generatedBy}</div>
            </div>
          </div>

          {/* KPI Metrics */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">সদস্য</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {summary.totalMembers} জন
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">মোট মিল</div>
              <div className="text-sm font-bold text-teal-700 mt-0.5">
                {formatMeal(summary.totalMeals)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-teal-500 bg-teal-50/50 text-center">
              <div className="text-[10px] text-teal-800 font-semibold">মিল রেট</div>
              <div className="text-sm font-bold text-teal-800 mt-0.5">
                {formatTaka(summary.mealRate)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">মোট বাজার</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatTaka(summary.totalGeneralBazaar)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">সার্বজনীন</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {formatTaka(summary.totalUniversalExpense)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">মোট জমা</div>
              <div className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatTaka(summary.totalDeposits)}
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">মেস স্থিতি</div>
              <div
                className={`text-xs font-bold mt-0.5 ${
                  summary.totalReceivable >= summary.totalPayable
                    ? 'text-emerald-700'
                    : 'text-rose-700'
                }`}
              >
                {summary.totalReceivable >= summary.totalPayable
                  ? `উদ্বৃত্ত (+${formatTaka(summary.totalReceivable - summary.totalPayable)})`
                  : `ঘাটতি (${formatTaka(summary.totalPayable - summary.totalReceivable)})`}
              </div>
            </div>
          </div>

          {/* Member Balance Table */}
          <div className="mb-2">
            <h2 className="text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span>১. সদস্যভিত্তিক বিস্তারিত মিল, খরচ ও চূড়ান্ত ব্যালেন্স বিবরণী</span>
              <span className="text-[10px] text-slate-500 font-normal">
                চূড়ান্ত ব্যালেন্স = পূর্বের ব্যালেন্স + মোট জমা + বাজার খরচ + সার্বজনীন পরিশোধ − সর্বমোট খরচ
              </span>
            </h2>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[10.5px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-2 px-2.5 border-r border-slate-800">সদস্যের নাম</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800">পূর্বের ব্যালেন্স</th>
                    <th className="py-2 px-2 text-center border-r border-slate-800">মিল</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800">মিল খরচ</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800">সার্বজনীন খরচ</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800 font-bold">সর্বমোট খরচ</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800 font-bold text-sky-400">বাজার খরচ (+)</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800 font-bold text-indigo-400">ইউনিক পরিশোধ (+)</th>
                    <th className="py-2 px-2 text-right border-r border-slate-800 font-bold text-emerald-400">মোট জমা (+)</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-800 font-bold">চূড়ান্ত ব্যালেন্স</th>
                    <th className="py-2 px-2 text-center">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {memberSummaries.map((m, idx) => {
                    const isReceivable = m.balanceStatus === 'receivable';
                    const isPayable = m.balanceStatus === 'payable';

                    return (
                      <tr key={m.memberId} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-1.5 px-2.5 font-bold text-slate-900 border-r border-slate-200">
                          {m.name}
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-600 border-r border-slate-200">
                          {formatTaka(m.previousBalance)}
                        </td>
                        <td className="py-1.5 px-2 text-center font-bold text-teal-800 border-r border-slate-200">
                          {formatMeal(m.totalMeal)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-700 border-r border-slate-200">
                          {formatTaka(m.mealCost)}
                        </td>
                        <td className="py-1.5 px-2 text-right text-slate-700 border-r border-slate-200">
                          {formatTaka(m.universalCostShare)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-slate-900 border-r border-slate-200">
                          {formatTaka(m.totalCost)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-sky-700 border-r border-slate-200">
                          {formatTaka(m.personalBazaarCost)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-indigo-700 border-r border-slate-200">
                          {formatTaka(m.universalExpensePaid || 0)}
                        </td>
                        <td className="py-1.5 px-2 text-right font-bold text-emerald-700 border-r border-slate-200">
                          {formatTaka(m.totalDeposit)}
                        </td>
                        <td
                          className={`py-1.5 px-2.5 text-right font-bold border-r border-slate-200 ${
                            isReceivable
                              ? 'text-emerald-700'
                              : isPayable
                              ? 'text-rose-700'
                              : 'text-slate-700'
                          }`}
                        >
                          {formatTaka(m.finalBalance)}
                        </td>
                        <td className="py-1.5 px-2 text-center">
                          {isReceivable ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9.5px]">
                              ফেরত পাবে
                            </span>
                          ) : isPayable ? (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[9.5px]">
                              বকেয়া
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[9.5px]">
                              পরিশোধিত
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                    <td className="py-2 px-2.5 border-r border-slate-300">সর্বমোট (Total)</td>
                    <td className="py-2 px-2 text-right border-r border-slate-300">
                      {formatTaka(memberSummaries.reduce((sum, m) => sum + m.previousBalance, 0))}
                    </td>
                    <td className="py-2 px-2 text-center text-teal-800 border-r border-slate-300">
                      {formatMeal(summary.totalMeals)}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-300">
                      {formatTaka(roundToTwo(summary.totalMeals * summary.mealRate))}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-300">
                      {formatTaka(summary.totalUniversalExpense)}
                    </td>
                    <td className="py-2 px-2 text-right border-r border-slate-300">
                      {formatTaka(summary.totalCost)}
                    </td>
                    <td className="py-2 px-2 text-right text-sky-700 border-r border-slate-300">
                      {formatTaka(summary.totalGeneralBazaar)}
                    </td>
                    <td className="py-2 px-2 text-right text-indigo-700 border-r border-slate-300">
                      {formatTaka(memberSummaries.reduce((sum, m) => sum + (m.universalExpensePaid || 0), 0))}
                    </td>
                    <td className="py-2 px-2 text-right text-emerald-700 border-r border-slate-300">
                      {formatTaka(summary.totalDeposits)}
                    </td>
                    <td className="py-2 px-2.5 text-right border-r border-slate-300">
                      {formatTaka(memberSummaries.reduce((sum, m) => sum + m.finalBalance, 0))}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-600 font-semibold text-[10px]">
                      হিসাব নিরীক্ষিত
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* PAGE BREAK INDICATOR (Print CSS handles page-break)       */}
        {/* ========================================================= */}
        <div className="page-break-after-always my-6 border-t border-dashed border-slate-300 relative text-center">
          <span className="bg-white px-3 text-[10px] text-slate-400 font-mono relative -top-2">
            পৃষ্ঠা বিভাজন (Page Break - Report 2 শুরু)
          </span>
        </div>

        {/* ========================================================= */}
        {/* REPORT 2: BAZAAR & DETAILED EXPENSES AUDIT                */}
        {/* ========================================================= */}
        <section
          id="report-2-bazaar-section"
          className="bg-white"
          style={{
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', sans-serif",
          }}
        >
          {/* Header */}
          <div className="border-b-2 border-sky-600 pb-3 mb-4 flex justify-between items-end">
            <div>
              <div className="text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                স্মার্ট মিল ম্যানেজার — বাজার ও খরচের অডিট খাতা
              </div>
              <h1 className="text-xl font-black text-slate-900 mt-0.5">
                বাজার ও সার্বজনীন খরচের বিস্তারিত তালিকা (Report 2)
              </h1>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                মাস: <strong className="text-slate-900">{month.name}</strong> | মোট বাজার ও ইউটিলিটি
                খরচ: <strong className="text-sky-700">{formatTaka(totalBazaarAmt + totalUniversalAmt)}</strong>
              </p>
            </div>
            <div className="text-right text-[11px] text-slate-500 font-mono">
              <div>অডিট শিট: পৃষ্ঠা ২ এর ২</div>
              <div>নিরীক্ষক: {generatedBy}</div>
            </div>
          </div>

          {/* 2.1 General Bazaar Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-xs font-bold text-slate-800">
                ২.১ সাধারণ বাজার খরচ (General Daily Bazaar Expenses)
              </h3>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-bold text-teal-800">
                  মোট বাজার: {formatTaka(summary.totalGeneralBazaar)}
                </span>
                {totalBazaarAmt !== summary.totalGeneralBazaar && (
                  <span className="text-slate-500 text-[10px]">
                    (নেট ট্রানজ্যাকশন: {formatTaka(totalBazaarAmt)})
                  </span>
                )}
              </div>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-teal-700 text-white font-semibold">
                    <th className="py-2 px-2.5 border-r border-teal-800">তারিখ</th>
                    <th className="py-2 px-2 border-r border-teal-800">বাজারকারী (সদস্য)</th>
                    <th className="py-2 px-2.5 border-r border-teal-800">বিবরণ ও পণ্যের তালিকা</th>
                    <th className="py-2 px-2 border-r border-teal-800">ধরণ</th>
                    <th className="py-2 px-2.5 text-right border-r border-teal-800 font-bold">পরিমাণ</th>
                    <th className="py-2 px-2">নথিবদ্ধকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {bazaarExpenses.length > 0 ? (
                    bazaarExpenses.map((b, idx) => (
                      <tr key={b.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                          {b.date}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-slate-800 border-r border-slate-200">
                          {memberNameMap[b.memberId] || 'অজ্ঞাত'}
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-700 border-r border-slate-200">
                          {b.description}
                          {b.amount < 0 && (
                            <span className="ml-1.5 inline-block text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-1 py-0.5 rounded font-medium">
                              কমন ফান্ড সমন্বয়
                            </span>
                          )}
                        </td>
                        <td className="py-1.5 px-2 text-slate-600 border-r border-slate-200">
                          {getBazaarTypeLabel(b.type)}
                        </td>
                        <td className={`py-1.5 px-2.5 text-right font-bold border-r border-slate-200 ${b.amount < 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                          {formatTaka(b.amount)}
                        </td>
                        <td className="py-1.5 px-2 text-slate-500 font-mono text-[9px]">
                          {b.createdBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        কোনো সাধারণ বাজার খরচ নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
                {bazaarExpenses.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td colSpan={4} className="py-1.5 px-2.5 border-r border-slate-300">
                        মোট বাজার খরচ (মিল রেটে অন্তর্ভুক্ত কেনাকাটা: {formatTaka(summary.totalGeneralBazaar)})
                      </td>
                      <td className="py-1.5 px-2.5 text-right border-r border-slate-300 text-teal-800">
                        {formatTaka(summary.totalGeneralBazaar)}
                      </td>
                      <td className="py-1.5 px-2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* 2.2 Universal Expenses Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-xs font-bold text-slate-800">
                ২.২ সার্বজনীন মেস খরচ (Universal Utilities & Bills)
              </h3>
              <span className="font-bold text-sky-800 text-[11px]">
                মোট সার্বজনীন: {formatTaka(totalUniversalAmt)}
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-sky-700 text-white font-semibold">
                    <th className="py-2 px-2.5 border-r border-sky-800">তারিখ</th>
                    <th className="py-2 px-2.5 border-r border-sky-800">খরচের বিবরণ</th>
                    <th className="py-2 px-2 text-center border-r border-sky-800">ভাগিদার সংখ্যা</th>
                    <th className="py-2 px-2.5 text-right border-r border-sky-800 font-bold">সর্বমোট টাকা</th>
                    <th className="py-2 px-2.5 text-right border-r border-sky-800 font-bold">মাথাপিছু ভাগ</th>
                    <th className="py-2 px-2">নথিবদ্ধকারী</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {universalExpenses.length > 0 ? (
                    universalExpenses.map((u, idx) => (
                      <tr key={u.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                          {u.date}
                        </td>
                        <td className="py-1.5 px-2.5 font-semibold text-slate-800 border-r border-slate-200">
                          {u.description}
                        </td>
                        <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-200">
                          {u.applicableMemberIds.length} জন
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 border-r border-slate-200">
                          {formatTaka(u.amount)}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-sky-700 border-r border-slate-200">
                          {formatTaka(u.perMemberShare)}
                        </td>
                        <td className="py-1.5 px-2 text-slate-500 font-mono text-[9px]">
                          {u.createdBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-4 text-center text-slate-400">
                        কোনো সার্বজনীন ইউটিলিটি খরচ নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
                {universalExpenses.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td colSpan={3} className="py-1.5 px-2.5 border-r border-slate-300">
                        মোট সার্বজনীন খরচ
                      </td>
                      <td className="py-1.5 px-2.5 text-right border-r border-slate-300 text-sky-800">
                        {formatTaka(totalUniversalAmt)}
                      </td>
                      <td colSpan={2} className="py-1.5 px-2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* 2.3 Member Deposits Table */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-1.5">
              <h3 className="text-xs font-bold text-slate-800">
                ২.৩ সদস্যদের জমা খাতা (Member Deposit Ledger)
              </h3>
              <span className="font-bold text-emerald-800 text-[11px]">
                মোট জমা সংগ্রহ: {formatTaka(totalDepositAmt)}
              </span>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-700 text-white font-semibold">
                    <th className="py-2 px-2.5 border-r border-slate-800">তারিখ</th>
                    <th className="py-2 px-2 border-r border-slate-800">সদস্যের নাম</th>
                    <th className="py-2 px-2.5 border-r border-slate-800">পদ্ধতি / নোট</th>
                    <th className="py-2 px-2.5 text-right border-r border-slate-800 font-bold">জমার পরিমাণ</th>
                    <th className="py-2 px-2">গ্রহীতা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {deposits.length > 0 ? (
                    deposits.map((d, idx) => (
                      <tr key={d.id} className={idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'}>
                        <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                          {d.date}
                        </td>
                        <td className="py-1.5 px-2 font-bold text-slate-800 border-r border-slate-200">
                          {memberNameMap[d.memberId] || 'অজ্ঞাত'}
                        </td>
                        <td className="py-1.5 px-2.5 text-slate-700 border-r border-slate-200">
                          {d.note || 'নিয়মিত জমা'}
                        </td>
                        <td className="py-1.5 px-2.5 text-right font-bold text-emerald-700 border-r border-slate-200">
                          {formatTaka(d.amount)}
                        </td>
                        <td className="py-1.5 px-2 text-slate-500 font-mono text-[9px]">
                          {d.createdBy}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400">
                        কোনো জমা নেই।
                      </td>
                    </tr>
                  )}
                </tbody>
                {deposits.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-t border-slate-300">
                      <td colSpan={3} className="py-1.5 px-2.5 border-r border-slate-300">
                        মোট সংগৃহীত জমা
                      </td>
                      <td className="py-1.5 px-2.5 text-right border-r border-slate-300 text-emerald-700">
                        {formatTaka(totalDepositAmt)}
                      </td>
                      <td className="py-1.5 px-2"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Official Sign-off & Audit Seal */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-end">
            <div className="text-center w-48">
              <div className="border-t border-slate-600 pt-2 font-bold text-xs text-slate-900">
                প্রস্তুতকারক (মেস ম্যানেজার)
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">স্বাক্ষর ও তারিখ</div>
            </div>

            <div className="text-center">
              <div className="border border-slate-300 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-[9px] font-bold text-slate-400 uppercase">
                অফিসিয়াল সিল
              </div>
            </div>

            <div className="text-center w-48">
              <div className="border-t border-slate-600 pt-2 font-bold text-xs text-slate-900">
                নিরীক্ষক ও সদস্য প্রতিনিধি
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">যাচাই ও অনুমোদন স্বাক্ষর</div>
            </div>
          </div>
        </section>
      </div>
    );
  }
);

DualReportView.displayName = 'DualReportView';

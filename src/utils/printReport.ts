/**
 * Smart Meal Manager — Print & High-Fidelity PDF Engine
 * Generates combined print sheets (Report 1: Monthly Financials + Report 2: Bazaar & Expenses)
 * and exports crisp, zero-corruption PDF documents with native Bengali font rendering.
 */

import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import {
  BazaarExpense,
  Deposit,
  Member,
  MemberFinancialSummary,
  Month,
  MonthFinancialSummary,
  UniversalExpense,
} from '../types';
import { formatMeal, formatTaka, roundToTwo } from './calculations';

export interface DualReportData {
  month: Month;
  summary: MonthFinancialSummary;
  members: Member[];
  bazaarExpenses: BazaarExpense[];
  universalExpenses: UniversalExpense[];
  deposits: Deposit[];
  generatedBy: string;
}

/**
 * Builds a clean, fully-styled HTML document containing BOTH Report 1 and Report 2.
 */
export function generateDualReportHtml(data: DualReportData): string {
  const { month, summary, members, bazaarExpenses, universalExpenses, deposits, generatedBy } =
    data;

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
  const totalUniversalAmt = universalExpenses.reduce((sum, u) => sum + (Number(u.amount) || 0), 0);
  const totalDepositAmt = deposits.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  const memberRowsHtml = memberSummaries
    .map((m, idx) => {
      const isReceivable = m.balanceStatus === 'receivable';
      const isPayable = m.balanceStatus === 'payable';
      const statusBadge = isReceivable
        ? `<span style="background:#dcfce7;color:#15803d;padding:2px 6px;border-radius:4px;font-weight:bold;">ফেরত পাবে (+${formatTaka(
            m.finalBalance
          )})</span>`
        : isPayable
        ? `<span style="background:#fee2e2;color:#b91c1c;padding:2px 6px;border-radius:4px;font-weight:bold;">বকেয়া (${formatTaka(
            m.finalBalance
          )})</span>`
        : `<span style="background:#f1f5f9;color:#475569;padding:2px 6px;border-radius:4px;font-weight:bold;">পরিশোধিত (০.০০)</span>`;

      return `
      <tr style="${idx % 2 === 1 ? 'background-color:#f8fafc;' : ''}">
        <td style="font-weight:bold;color:#0f172a;">${m.name}</td>
        <td style="text-align:right;">${formatTaka(m.previousBalance)}</td>
        <td style="text-align:center;font-weight:bold;color:#0f766e;">${formatMeal(m.totalMeal)}</td>
        <td style="text-align:right;">${formatTaka(m.mealCost)}</td>
        <td style="text-align:right;">${formatTaka(m.universalCostShare)}</td>
        <td style="text-align:right;font-weight:bold;color:#0f172a;">${formatTaka(m.totalCost)}</td>
        <td style="text-align:right;font-weight:bold;color:#0284c7;">${formatTaka(m.personalBazaarCost)}</td>
        <td style="text-align:right;font-weight:bold;color:#15803d;">${formatTaka(m.totalDeposit)}</td>
        <td style="text-align:right;font-weight:bold;color:${
          isReceivable ? '#15803d' : isPayable ? '#b91c1c' : '#334155'
        };">${formatTaka(m.finalBalance)}</td>
        <td style="text-align:center;">${statusBadge}</td>
      </tr>
    `;
    })
    .join('');

  const bazaarRowsHtml =
    bazaarExpenses.length > 0
      ? bazaarExpenses
          .map(
            (b, idx) => `
        <tr style="${idx % 2 === 1 ? 'background-color:#f8fafc;' : ''}">
          <td style="white-space:nowrap;">${b.date}</td>
          <td style="font-weight:600;">${memberNameMap[b.memberId] || 'অজ্ঞাত'}</td>
          <td>${b.description}</td>
          <td style="text-transform:capitalize;">${b.type.replace('_', ' ')}</td>
          <td style="text-align:right;font-weight:bold;">${formatTaka(b.amount)}</td>
          <td style="color:#64748b;font-size:9px;">${b.createdBy}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="6" style="text-align:center;padding:12px;color:#64748b;">কোনো সাধারণ বাজার খরচ রেকর্ড করা হয়নি।</td></tr>`;

  const universalRowsHtml =
    universalExpenses.length > 0
      ? universalExpenses
          .map(
            (u, idx) => `
        <tr style="${idx % 2 === 1 ? 'background-color:#f8fafc;' : ''}">
          <td style="white-space:nowrap;">${u.date}</td>
          <td style="font-weight:600;">${u.description}</td>
          <td style="text-align:center;">${u.applicableMemberIds.length} জন সদস্য</td>
          <td style="text-align:right;font-weight:bold;">${formatTaka(u.amount)}</td>
          <td style="text-align:right;color:#0369a1;font-weight:bold;">${formatTaka(
            u.perMemberShare
          )}</td>
          <td style="color:#64748b;font-size:9px;">${u.createdBy}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="6" style="text-align:center;padding:12px;color:#64748b;">কোনো সার্বজনীন খরচ রেকর্ড করা হয়নি।</td></tr>`;

  const depositRowsHtml =
    deposits.length > 0
      ? deposits
          .map(
            (d, idx) => `
        <tr style="${idx % 2 === 1 ? 'background-color:#f8fafc;' : ''}">
          <td style="white-space:nowrap;">${d.date}</td>
          <td style="font-weight:600;">${memberNameMap[d.memberId] || 'অজ্ঞাত'}</td>
          <td>${d.note || 'নিয়মিত জমা'}</td>
          <td style="text-align:right;font-weight:bold;color:#15803d;">${formatTaka(d.amount)}</td>
          <td style="color:#64748b;font-size:9px;">${d.createdBy}</td>
        </tr>
      `
          )
          .join('')
      : `<tr><td colspan="5" style="text-align:center;padding:12px;color:#64748b;">কোনো জমা রেকর্ড করা হয়নি।</td></tr>`;

  return `
    <div style="font-family:'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:#0f172a; background:#ffffff; margin:0; padding:16px; font-size:11px; line-height:1.4;">
      
      <!-- REPORT 1: MONTHLY FINANCIAL SUMMARY -->
      <section style="margin-bottom:28px;">
        <div style="border-bottom:2.5px solid #0f766e; padding-bottom:10px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <h1 style="margin:0; font-size:20px; font-weight:800; color:#0f766e; letter-spacing:-0.5px;">
              স্মার্ট মিল ম্যানেজার — মাসিক হিসাব ও ব্যালেন্স শিট
            </h1>
            <p style="margin:4px 0 0 0; font-size:12px; color:#475569; font-weight:600;">
              মাস: <span style="color:#0f172a;">${month.name}</span> | সময়কাল: ${month.startDate} থেকে ${month.endDate} | স্ট্যাটাস: ${
    month.status === 'locked' ? 'লকড (চূড়ান্ত)' : 'সক্রিয় (চলমান)'
  }
            </p>
          </div>
          <div style="text-align:right; font-size:10px; color:#64748b;">
            <div>প্রিন্ট তারিখ: <strong>${dateStr}</strong></div>
            <div>প্রস্তুতকারক: <strong>${generatedBy}</strong></div>
          </div>
        </div>

        <!-- Metrics Overview Grid -->
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; margin-bottom:14px;">
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">মোট সদস্য</div>
            <div style="font-size:14px; font-weight:800; color:#0f172a;">${summary.totalMembers} জন</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">মোট মিল</div>
            <div style="font-size:14px; font-weight:800; color:#0f766e;">${formatMeal(summary.totalMeals)}</div>
          </div>
          <div style="border:1px solid #0f766e; border-radius:6px; padding:6px; background:#f0fdfa; text-align:center;">
            <div style="font-size:9px; color:#0f766e; font-weight:bold;">মিল রেট</div>
            <div style="font-size:14px; font-weight:800; color:#0f766e;">${formatTaka(summary.mealRate)}</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">মোট বাজার</div>
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${formatTaka(summary.totalGeneralBazaar)}</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">সার্বজনীন খরচ</div>
            <div style="font-size:13px; font-weight:800; color:#0f172a;">${formatTaka(summary.totalUniversalExpense)}</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">মোট জমা</div>
            <div style="font-size:13px; font-weight:800; color:#15803d;">${formatTaka(summary.totalDeposits)}</div>
          </div>
          <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
            <div style="font-size:9px; color:#64748b; font-weight:bold;">মেস হিসাব স্থিতি</div>
            <div style="font-size:12px; font-weight:800; color:${
              summary.totalReceivable >= summary.totalPayable ? '#15803d' : '#b91c1c'
            };">
              ${
                summary.totalReceivable >= summary.totalPayable
                  ? `উদ্বৃত্ত (+${formatTaka(summary.totalReceivable - summary.totalPayable)})`
                  : `ঘাটতি (${formatTaka(summary.totalPayable - summary.totalReceivable)})`
              }
            </div>
          </div>
        </div>

        <!-- Member Balances Table -->
        <h2 style="font-size:13px; font-weight:700; color:#1e293b; margin:0 0 6px 0;">
          ১. সদস্যভিত্তিক বিস্তারিত মিল, খরচ ও ব্যালেন্স বিবরণী (Member Balance Sheet)
        </h2>
        <table style="width:100%; border-collapse:collapse; font-size:10px; border:1px solid #cbd5e1; margin-bottom:8px;">
          <thead>
            <tr style="background:#0f172a; color:#ffffff;">
              <th style="padding:6px 8px; text-align:left; border:1px solid #334155;">সদস্যের নাম</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155;">পূর্বের ব্যালেন্স</th>
              <th style="padding:6px; text-align:center; border:1px solid #334155;">মিল</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155;">মিল খরচ</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155;">সার্বজনীন খরচ</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155; font-weight:bold;">সর্বমোট খরচ</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155; font-weight:bold; color:#38bdf8;">বাজার খরচ (+)</th>
              <th style="padding:6px; text-align:right; border:1px solid #334155; font-weight:bold; color:#4ade80;">মোট জমা (+)</th>
              <th style="padding:6px 8px; text-align:right; border:1px solid #334155; font-weight:bold;">চূড়ান্ত ব্যালেন্স</th>
              <th style="padding:6px; text-align:center; border:1px solid #334155;">স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            ${memberRowsHtml}
          </tbody>
          <tfoot>
            <tr style="background:#f1f5f9; font-weight:bold; border-top:2px solid #94a3b8;">
              <td style="padding:6px 8px; border:1px solid #cbd5e1;">সর্বমোট (Total)</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1;">${formatTaka(
                memberSummaries.reduce((sum, m) => sum + m.previousBalance, 0)
              )}</td>
              <td style="padding:6px; text-align:center; border:1px solid #cbd5e1;">${formatMeal(summary.totalMeals)}</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1;">${formatTaka(
                roundToTwo(summary.totalMeals * summary.mealRate)
              )}</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1;">${formatTaka(summary.totalUniversalExpense)}</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1;">${formatTaka(summary.totalCost)}</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1; color:#0284c7; font-weight:bold;">${formatTaka(summary.totalGeneralBazaar)}</td>
              <td style="padding:6px; text-align:right; border:1px solid #cbd5e1; color:#15803d; font-weight:bold;">${formatTaka(summary.totalDeposits)}</td>
              <td style="padding:6px 8px; border:1px solid #cbd5e1; font-weight:bold;">${formatTaka(
                memberSummaries.reduce((sum, m) => sum + m.finalBalance, 0)
              )}</td>
              <td style="padding:6px; text-align:center; border:1px solid #cbd5e1;">হিসাব নিরীক্ষিত</td>
            </tr>
          </tfoot>
        </table>
        <div style="font-size:9px; color:#64748b; font-style:italic;">
          * চূড়ান্ত ব্যালেন্স সূত্র: পূর্বের ব্যালেন্স + মোট জমা + বাজার খরচ − সর্বমোট খরচ। ধনাত্মক (+) হলে সদস্য মেস থেকে ফেরত পাবেন; ঋণাত্মক (-) হলে সদস্যকে মেসে বকেয়া পরিশোধ করতে হবে।
        </div>
      </section>

      <!-- PAGE BREAK FOR SECOND REPORT -->
      <div style="page-break-before:always; break-before:page; margin-top:24px; border-top:2px dashed #94a3b8; padding-top:20px;"></div>

      <!-- REPORT 2: BAZAAR & UTILITY EXPENSES AUDIT -->
      <section>
        <div style="border-bottom:2.5px solid #0284c7; padding-bottom:10px; margin-bottom:14px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div>
            <h1 style="margin:0; font-size:20px; font-weight:800; color:#0284c7; letter-spacing:-0.5px;">
              স্মার্ট মিল ম্যানেজার — বাজার ও খরচের অডিট খাতা
            </h1>
            <p style="margin:4px 0 0 0; font-size:12px; color:#475569; font-weight:600;">
              মাস: <span style="color:#0f172a;">${month.name}</span> | মোট বাজার ও ইউটিলিটি খরচ: ${formatTaka(
    totalBazaarAmt + totalUniversalAmt
  )}
            </p>
          </div>
          <div style="text-align:right; font-size:10px; color:#64748b;">
            <div>অডিট পেজ: <strong>২ এর ২</strong></div>
            <div>যাচাইকারী: <strong>${generatedBy}</strong></div>
          </div>
        </div>

        <!-- 2.1 General Bazaar Table -->
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h3 style="font-size:12px; font-weight:700; color:#0f172a; margin:0;">
              ২.১ সাধারণ বাজার খরচ (General Daily Bazaar)
            </h3>
            <span style="font-weight:bold; color:#0f766e; font-size:11px;">মোট বাজার: ${formatTaka(totalBazaarAmt)}</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px; border:1px solid #cbd5e1;">
            <thead>
              <tr style="background:#0f766e; color:#ffffff;">
                <th style="padding:5px 6px; text-align:left; border:1px solid #115e59;">তারিখ</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #115e59;">বাজারকারী (সদস্য)</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #115e59;">বিবরণ / পণ্যের তালিকা</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #115e59;">ধরণ</th>
                <th style="padding:5px 6px; text-align:right; border:1px solid #115e59;">পরিমাণ (টাকা)</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #115e59;">নথিবদ্ধকারী</th>
              </tr>
            </thead>
            <tbody>
              ${bazaarRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- 2.2 Universal Expenses Table -->
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h3 style="font-size:12px; font-weight:700; color:#0f172a; margin:0;">
              ২.২ সার্বজনীন মেস খরচ (Universal Utilities & Bills)
            </h3>
            <span style="font-weight:bold; color:#0284c7; font-size:11px;">মোট সার্বজনীন: ${formatTaka(totalUniversalAmt)}</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px; border:1px solid #cbd5e1;">
            <thead>
              <tr style="background:#0284c7; color:#ffffff;">
                <th style="padding:5px 6px; text-align:left; border:1px solid #0369a1;">তারিখ</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #0369a1;">খরচের বিবরণ</th>
                <th style="padding:5px 6px; text-align:center; border:1px solid #0369a1;">ভাগিদার সংখ্যা</th>
                <th style="padding:5px 6px; text-align:right; border:1px solid #0369a1;">সর্বমোট টাকা</th>
                <th style="padding:5px 6px; text-align:right; border:1px solid #0369a1;">মাথাপিছু ভাগ</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #0369a1;">নথিবদ্ধকারী</th>
              </tr>
            </thead>
            <tbody>
              ${universalRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- 2.3 Member Deposits Table -->
        <div style="margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <h3 style="font-size:12px; font-weight:700; color:#0f172a; margin:0;">
              ২.৩ সদস্যদের জমা খাতা (Member Deposit Ledger)
            </h3>
            <span style="font-weight:bold; color:#15803d; font-size:11px;">মোট জমা সংগ্রহ: ${formatTaka(totalDepositAmt)}</span>
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:9.5px; border:1px solid #cbd5e1;">
            <thead>
              <tr style="background:#475569; color:#ffffff;">
                <th style="padding:5px 6px; text-align:left; border:1px solid #334155;">তারিখ</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #334155;">সদস্যের নাম</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #334155;">পদ্ধতি / নোট</th>
                <th style="padding:5px 6px; text-align:right; border:1px solid #334155;">জমার পরিমাণ</th>
                <th style="padding:5px 6px; text-align:left; border:1px solid #334155;">গ্রহীতা</th>
              </tr>
            </thead>
            <tbody>
              ${depositRowsHtml}
            </tbody>
          </table>
        </div>

        <!-- Official Sign-off & Audit Seal -->
        <div style="margin-top:36px; padding-top:20px; display:flex; justify-content:space-between; align-items:flex-end;">
          <div style="text-align:center; width:220px;">
            <div style="border-top:1.5px solid #475569; padding-top:6px; font-weight:bold; font-size:11px; color:#1e293b;">
              প্রস্তুতকারক (মেস ম্যানেজার)
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">স্বাক্ষর ও তারিখ</div>
          </div>

          <div style="text-align:center;">
            <div style="border:1.5px solid #cbd5e1; border-radius:50%; width:64px; height:64px; display:flex; align-items:center; justify-content:center; margin:0 auto; font-size:8px; font-weight:bold; color:#64748b; text-align:center; text-transform:uppercase;">
              অফিসিয়াল<br/>সিল
            </div>
          </div>

          <div style="text-align:center; width:220px;">
            <div style="border-top:1.5px solid #475569; padding-top:6px; font-weight:bold; font-size:11px; color:#1e293b;">
              নিরীক্ষক ও সদস্য প্রতিনিধি
            </div>
            <div style="font-size:9px; color:#64748b; margin-top:2px;">যাচাই ও অনুমোদন স্বাক্ষর</div>
          </div>
        </div>

      </section>
    </div>
  `;
}

/**
 * Triggers printing of BOTH reports cleanly.
 * 1. Attempts native window.print() if supported in the current browsing context.
 * 2. If running inside a sandboxed iframe or if window.print() throws, tries an off-screen
 *    properly sized print frame.
 * 3. Returns a boolean indicating whether a print execution was dispatched.
 */
export function printBothReports(data: DualReportData): boolean {
  // Method 1: Try native window.print() on the parent document
  // In screen view, the printable element (#dual-report-printable-area) is hidden by .print-only.
  // When window.print() is called, @media print hides all UI & no-print elements and renders the printable report.
  try {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    window.print();
    return true;
  } catch (windowPrintErr) {
    console.warn('Direct window.print() not permitted in this context, attempting iframe printer:', windowPrintErr);
  }

  // Method 2: Off-screen iframe with actual layout dimensions (not 0x0)
  try {
    const html = generateDualReportHtml(data);
    const title = `Smart_Meal_Manager_Complete_Report_${data.month.name.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

    // Clean up any existing print iframe
    const oldIframe = document.getElementById('dual-report-print-iframe');
    if (oldIframe) {
      oldIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'dual-report-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1024px';
    iframe.style.height = '768px';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      return false;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>${title}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
          }
          body {
            font-family: 'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
      </html>
    `);
    doc.close();

    // Trigger iframe print after layout cycle
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print focus trigger:', err);
      }
      // Garbage collect iframe after printing
      setTimeout(() => {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch (_) {}
      }, 60000);
    }, 400);

    return true;
  } catch (err) {
    console.error('All print methods failed:', err);
    return false;
  }
}

/**
 * Downloads a high-resolution, pixel-perfect PDF of any HTML element using html2canvas & jsPDF.
 * Because it renders through the browser's font and graphics engine, Bengali characters and ৳ symbols
 * are 100% crisp with ZERO character corruption.
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
  onProgress?: (step: string) => void
): Promise<void> {
  onProgress?.('বাংলা ফন্ট প্রস্তুত হচ্ছে...');

  // Wait for Google & system Bengali fonts to be fully ready before rendering
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  // Scroll to top to ensure accurate layout calculation
  const originalScrollTop = window.scrollY;
  window.scrollTo(0, 0);

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (retina crispness)
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1080,
      onclone: (clonedDoc, clonedElement) => {
        // Bring offscreen capture container into view in cloned DOM
        const offscreenWrapper = clonedDoc.getElementById('offscreen-report-export-wrapper');
        if (offscreenWrapper) {
          offscreenWrapper.style.position = 'static';
          offscreenWrapper.style.left = '0';
          offscreenWrapper.style.top = '0';
          offscreenWrapper.style.visibility = 'visible';
          offscreenWrapper.style.opacity = '1';
          offscreenWrapper.style.display = 'block';
        }

        if (clonedElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
        }

        // Enforce Bengali font family across all elements in the cloned DOM
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.fontFamily = "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif";
          }
        });
      },
    });

    onProgress?.('পিডিএফ পৃষ্ঠা সাজানো হচ্ছে...');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm
    const margin = 8;
    const printWidth = pageWidth - margin * 2;
    const printHeight = (canvas.height * printWidth) / canvas.width;

    let heightLeft = printHeight;
    let position = margin;
    let pageCount = 0;

    // Render pages seamlessly
    while (heightLeft > 0) {
      if (pageCount > 0) {
        pdf.addPage();
      }
      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position - pageCount * (pageHeight - margin * 2),
        printWidth,
        printHeight,
        undefined,
        'FAST'
      );
      pageCount++;
      heightLeft -= pageHeight - margin * 2;
    }

    onProgress?.('ডাউনলোড হচ্ছে...');
    pdf.save(filename);
  } finally {
    window.scrollTo(0, originalScrollTop);
  }
}

/**
 * Downloads a high-resolution, crystal-clear PNG image of any HTML element.
 * Fully renders native Bengali text, typography, icons, and status badges.
 */
export async function downloadElementAsImage(
  element: HTMLElement,
  filename: string,
  onProgress?: (step: string) => void
): Promise<void> {
  onProgress?.('বাংলা ফন্ট প্রস্তুত হচ্ছে...');

  // Wait for fonts to be ready
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch (_) {}
  }

  const originalScrollTop = window.scrollY;
  window.scrollTo(0, 0);

  try {
    onProgress?.('ইমেজ জেনারেট করা হচ্ছে...');
    const canvas = await html2canvas(element, {
      scale: 2, // 2x Retina sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1080,
      onclone: (clonedDoc, clonedElement) => {
        // Bring offscreen capture container into view in cloned DOM
        const offscreenWrapper = clonedDoc.getElementById('offscreen-report-export-wrapper');
        if (offscreenWrapper) {
          offscreenWrapper.style.position = 'static';
          offscreenWrapper.style.left = '0';
          offscreenWrapper.style.top = '0';
          offscreenWrapper.style.visibility = 'visible';
          offscreenWrapper.style.opacity = '1';
          offscreenWrapper.style.display = 'block';
        }

        if (clonedElement) {
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
        }

        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.style) {
            htmlEl.style.fontFamily =
              "'Hind Siliguri', 'Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', -apple-system, BlinkMacSystemFont, sans-serif";
          }
        });
      },
    });

    onProgress?.('ইমেজ ফাইল ডাউনলোড হচ্ছে...');
    const imageUri = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const safeFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.download = safeFilename;
    link.href = imageUri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    window.scrollTo(0, originalScrollTop);
  }
}

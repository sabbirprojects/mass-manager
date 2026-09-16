import React, { useRef, useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle,
  Eye,
  Calendar,
  Layers,
  X,
  Sparkles,
  Loader2,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateMonthlyReportPdf, generateBazaarReportPdf } from '../utils/pdfGenerator';
import { printBothReports, downloadElementAsPdf, downloadElementAsImage } from '../utils/printReport';
import { formatSafeFileName } from '../utils/calculations';
import { BalanceSummary } from './BalanceSummary';
import { DualReportView } from './DualReportView';

export const ReportsPage: React.FC = () => {
  const {
    activeMonth,
    financialSummary,
    bazaarExpenses,
    universalExpenses,
    deposits,
    members,
    currentUser,
  } = useApp();

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'balance' | 'preview'>('balance');

  const dualReportRef = useRef<HTMLDivElement>(null);

  if (!activeMonth || !financialSummary) return null;

  const activeMembers = useMemo(
    () => members.filter((m) => m.monthId === activeMonth.id && !m.isRemoved),
    [members, activeMonth.id]
  );
  const currentBazaar = bazaarExpenses.filter((b) => b.monthId === activeMonth.id);
  const currentUniversal = universalExpenses.filter((u) => u.monthId === activeMonth.id);
  const currentDeposits = deposits.filter((d) => d.monthId === activeMonth.id);
  const managerName = currentUser?.displayName || currentUser?.username || 'মেস ম্যানেজার';

  const dualReportData = {
    month: activeMonth,
    summary: financialSummary,
    members: activeMembers,
    bazaarExpenses: currentBazaar,
    universalExpenses: currentUniversal,
    deposits: currentDeposits,
    generatedBy: managerName,
  };

  const safeName = formatSafeFileName(activeMonth.name, 'September_2026');

  /**
   * Direct print trigger with fallback feedback
   */
  const handleDirectPrint = () => {
    setPrintNotice(null);
    const dispatched = printBothReports(dualReportData);
    if (!dispatched) {
      setPrintNotice('আইফ্রেম বা ব্রাউজার সিকিউরিটির কারণে সরাসরি প্রিন্ট উইন্ডো না খুললে, পাশের "PDF ডাউনলোড" বাটন ব্যবহার করে এক ক্লিকে প্রিন্ট করুন।');
    }
  };

  /**
   * Handle printing BOTH reports simultaneously:
   * Opens preview modal AND triggers print dialog
   */
  const handlePrintBoth = () => {
    setShowPrintModal(true);
    setPrintNotice(null);
    const dispatched = printBothReports(dualReportData);
    if (!dispatched) {
      setPrintNotice('আইফ্রেম বা ব্রাউজার সিকিউরিটির কারণে সরাসরি প্রিন্ট উইন্ডো না খুললে, পাশের "PDF ডাউনলোড" বাটন ব্যবহার করে এক ক্লিকে প্রিন্ট করুন।');
    }
  };

  /**
   * Download combined high-resolution PDF of BOTH reports with native Bengali fonts
   */
  const handleDownloadBothPdf = async () => {
    if (!dualReportRef.current) return;
    setIsGenerating(true);
    try {
      await downloadElementAsPdf(
        dualReportRef.current,
        `SMM_Complete_Dual_Report_${safeName}.pdf`,
        (status) => setLoadingStatus(status)
      );
      setSuccessMsg('উভয় রিপোর্টের সম্পূর্ণ বাংলা PDF সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('PDF তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  /**
   * Download combined high-resolution PNG image of BOTH reports
   */
  const handleDownloadBothImage = async () => {
    if (!dualReportRef.current) return;
    setIsGenerating(true);
    try {
      await downloadElementAsImage(
        dualReportRef.current,
        `SMM_Complete_Report_${safeName}.png`,
        (status) => setLoadingStatus(status)
      );
      setSuccessMsg('রিপোর্টের হাই-রেজোলিউশন ইমেজ (PNG) সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e) {
      console.error('Image export error:', e);
      alert('ইমেজ তৈরিতে সমস্যা হয়েছে। পুনরায় চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  /**
   * Download Monthly Report PDF with full authentic Bengali typography
   */
  const handleDownloadMonthlyPdf = async () => {
    setIsGenerating(true);
    try {
      const sectionEl = document.getElementById('report-1-monthly-section');
      if (sectionEl) {
        await downloadElementAsPdf(
          sectionEl,
          `SMM_Monthly_Report_${safeName}.pdf`,
          (status) => setLoadingStatus(status)
        );
      } else {
        generateMonthlyReportPdf({
          activeMonth,
          financialSummary,
          members: activeMembers,
          bazaarExpenses: currentBazaar,
          universalExpenses: currentUniversal,
          deposits: currentDeposits,
          generatedBy: managerName,
        });
      }
      setSuccessMsg('মাসিক হিসাব বিবরণী বাংলা PDF সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error('Monthly PDF error:', e);
      generateMonthlyReportPdf({
        activeMonth,
        financialSummary,
        members: activeMembers,
        bazaarExpenses: currentBazaar,
        universalExpenses: currentUniversal,
        deposits: currentDeposits,
        generatedBy: managerName,
      });
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  /**
   * Download Monthly Report as PNG Image
   */
  const handleDownloadMonthlyImage = async () => {
    setIsGenerating(true);
    try {
      const sectionEl = document.getElementById('report-1-monthly-section');
      if (sectionEl) {
        await downloadElementAsImage(
          sectionEl,
          `SMM_Monthly_Report_${safeName}.png`,
          (status) => setLoadingStatus(status)
        );
        setSuccessMsg('মাসিক হিসাব বিবরণী ইমেজ (PNG) সফলভাবে ডাউনলোড হয়েছে!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('Monthly Image error:', e);
      alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  /**
   * Download Bazaar Report PDF with full authentic Bengali typography
   */
  const handleDownloadBazaarPdf = async () => {
    setIsGenerating(true);
    try {
      const sectionEl = document.getElementById('report-2-bazaar-section');
      if (sectionEl) {
        await downloadElementAsPdf(
          sectionEl,
          `SMM_Bazaar_Report_${safeName}.pdf`,
          (status) => setLoadingStatus(status)
        );
      } else {
        generateBazaarReportPdf({
          activeMonth,
          bazaarExpenses: currentBazaar,
          universalExpenses: currentUniversal,
          members: activeMembers,
          deposits: currentDeposits,
          generatedBy: managerName,
        });
      }
      setSuccessMsg('বাজার খরচের বিস্তারিত তালিকা বাংলা PDF সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      console.error('Bazaar PDF error:', e);
      generateBazaarReportPdf({
        activeMonth,
        bazaarExpenses: currentBazaar,
        universalExpenses: currentUniversal,
        members: activeMembers,
        deposits: currentDeposits,
        generatedBy: managerName,
      });
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  /**
   * Download Bazaar Report as PNG Image
   */
  const handleDownloadBazaarImage = async () => {
    setIsGenerating(true);
    try {
      const sectionEl = document.getElementById('report-2-bazaar-section');
      if (sectionEl) {
        await downloadElementAsImage(
          sectionEl,
          `SMM_Bazaar_Report_${safeName}.png`,
          (status) => setLoadingStatus(status)
        );
        setSuccessMsg('বাজার খরচের তালিকা ইমেজ (PNG) সফলভাবে ডাউনলোড হয়েছে!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (e) {
      console.error('Bazaar Image error:', e);
      alert('ইমেজ ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsGenerating(false);
      setLoadingStatus(null);
    }
  };

  return (
    <div id="reports-page-container" className="space-y-4">
      {/* Top Banner & Primary Export / Print Actions */}
      <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                মাসিক অডিট ও পূর্ণাঙ্গ রিপোর্ট (Reports & Print Center)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                মাস: <strong className="text-slate-800">{activeMonth.name}</strong> | প্রিন্ট বাটনে
                ক্লিক করলে <strong>উভয় রিপোর্ট একসাথে প্রিন্ট হবে</strong>।
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* PRIMARY: Print Both Reports */}
          <button
            id="print-both-reports-btn"
            type="button"
            onClick={handlePrintBoth}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
            title="উভয় রিপোর্ট একসাথে প্রিন্ট করুন (Report 1 + Report 2)"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            <span>উভয় রিপোর্ট প্রিন্ট করুন</span>
          </button>

          {/* Download Both Reports PDF (High-Res Bengali) */}
          <button
            id="download-both-pdf-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadBothPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="উভয় রিপোর্টের সম্পূর্ণ বাংলা PDF ডাউনলোড"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>সম্পূর্ণ PDF</span>
          </button>

          {/* Download Image (PNG) */}
          <button
            id="download-image-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadBothImage}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
            title="রিপোর্টের হাই-রেজোলিউশন ইমেজ (PNG) ডাউনলোড"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ইমেজ ডাউনলোড (PNG)</span>
          </button>

          {/* Individual PDF Downloads */}
          <button
            id="download-monthly-pdf-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadMonthlyPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            title="মাসিক হিসাব বিবরণী PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>মাসিক হিসাব PDF</span>
          </button>

          <button
            id="download-bazaar-pdf-btn"
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadBazaarPdf}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            title="বাজার খরচের তালিকা PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>বাজার খাতা PDF</span>
          </button>

          {/* View Toggle */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'balance' ? 'preview' : 'balance')}
            className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer border ${
              activeTab === 'preview'
                ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-teal-600" />
            <span>{activeTab === 'preview' ? 'ব্যালেন্স ভিউ' : 'প্রিন্ট প্রিভিউ'}</span>
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {isGenerating && loadingStatus && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 text-xs font-medium rounded-xl flex items-center gap-2 animate-pulse no-print">
          <Loader2 className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
          <span>{loadingStatus} অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন...</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 no-print">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB 1: Standard Interactive Balance View */}
      {activeTab === 'balance' && (
        <div className="no-print">
          <BalanceSummary />
        </div>
      )}

      {/* TAB 2 or Preview Mode: Dual Report Sheet on Screen */}
      {activeTab === 'preview' && (
        <div className="no-print space-y-3">
          <div className="flex flex-wrap items-center justify-between p-3 bg-slate-100 rounded-xl text-xs text-slate-700 gap-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>উভয় রিপোর্টের অফিশিয়াল প্রিভিউ (Report 1: মাসিক হিসাব + Report 2: বাজার খাতা)</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrintBoth}
                className="px-3 py-1 bg-slate-900 text-white text-[11px] font-bold rounded-lg hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3 h-3 text-teal-400" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadBothPdf}
                className="px-3 py-1 bg-teal-600 text-white text-[11px] font-bold rounded-lg hover:bg-teal-700 transition flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>PDF সেভ করুন</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadBothImage}
                className="px-3 py-1 bg-sky-600 text-white text-[11px] font-bold rounded-lg hover:bg-sky-700 transition flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3 h-3" />
                <span>ইমেজ সেভ করুন</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto p-4 bg-slate-200/60 rounded-2xl border border-slate-300">
            <DualReportView ref={dualReportRef} {...dualReportData} />
          </div>
        </div>
      )}

      {/* Off-screen container specifically for capturing PDF/Image export with full geometry when tab is 'balance' */}
      {activeTab === 'balance' && (
        <div
          id="offscreen-report-export-wrapper"
          aria-hidden="true"
          className="no-print pointer-events-none"
          style={{
            position: 'absolute',
            left: '-99999px',
            top: '0',
            width: '1080px',
            visibility: 'visible',
          }}
        >
          <DualReportView ref={dualReportRef} {...dualReportData} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-SCREEN DUAL REPORT PRINT PREVIEW MODAL                               */}
      {/* ========================================================================= */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print animate-in fade-in duration-150">
          <div className="bg-slate-100 w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl flex flex-col border border-slate-300 overflow-hidden">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    উভয় রিপোর্টের প্রিন্ট ও অডিট খাতা (Report 1 + Report 2)
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    মাসিক ব্যালেন্স শিট এবং বাজার/সার্বজনীন খরচের সম্পূর্ণ হিসাব প্রস্তুত
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>এখনই প্রিন্ট করুন</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBothPdf}
                  className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadBothImage}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>ইমেজ ডাউনলোড</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
                  title="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print feedback / Sandbox warning banner */}
            {printNotice && (
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{printNotice}</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadBothPdf}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
                >
                  PDF সংরক্ষণ করুন
                </button>
              </div>
            )}

            {/* Modal Body: Scrollable Paper Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/80">
              <div className="max-w-4xl mx-auto shadow-lg bg-white rounded-xl">
                <DualReportView {...dualReportData} />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2 shrink-0">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <span>💡 প্রিন্ট উইন্ডো না খুললে <strong>&apos;PDF ডাউনলোড&apos;</strong> বাটন চেপে সরাসরি যেকোনো প্রিন্টারে প্রিন্ট করতে পারেন।</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-teal-400" />
                  <span>প্রিন্ট করুন</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NATIVE PRINT CONTAINER: ONLY RENDERED ON PHYSICAL PRINT (CTRL+P / PRINT)  */}
      {/* ========================================================================= */}
      <div id="dual-report-printable-area" className="print-only">
        <DualReportView {...dualReportData} />
      </div>
    </div>
  );
};

import React from 'react';
import { MonthSummary } from './MonthSummary';
import { QuickActions } from './QuickActions';
import { LockStatus } from './LockStatus';
import { MemberList } from './MemberList';
import { useApp } from '../context/AppContext';
import { formatTaka } from '../utils/calculations';
import { ShoppingBag, Users, Utensils, Calendar, ChevronRight } from 'lucide-react';

import { MonthCreateForm } from './MonthCreateForm';

export const DashboardView: React.FC = () => {
  const { activeMonth, financialSummary, bazaarExpenses, setActiveTab, members, currentUser } = useApp();
  const [isMonthCreateOpen, setIsMonthCreateOpen] = React.useState(false);

  if (!activeMonth || !financialSummary) {
    return (
      <div
        id="dashboard-empty-container"
        className="p-8 text-center max-w-lg mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xs mt-8 space-y-4"
      >
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          স্বাগতম, {currentUser?.displayName || currentUser?.username || 'ইউজার'}!
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          আপনার মেস অ্যাকাউন্টে এখনও কোনো মাস তৈরি করা হয়নি। মিল ও বাজার খরচ হিসাব শুরু করতে প্রথম মাসটি তৈরি করুন।
        </p>
        <button
          type="button"
          id="dashboard-create-first-month-btn"
          onClick={() => setIsMonthCreateOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>নতুন মাস তৈরি করুন</span>
        </button>

        <MonthCreateForm
          isOpen={isMonthCreateOpen}
          onClose={() => setIsMonthCreateOpen(false)}
        />
      </div>
    );
  }

  const currentBazaar = bazaarExpenses.filter((b) => b.monthId === activeMonth.id);
  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === activeMonth.id);

  return (
    <div id="dashboard-view-container" className="space-y-4">
      {/* Month Lock Banner if locked */}
      {activeMonth.status === 'locked' && <LockStatus />}

      {/* Primary Financial Metric Cards */}
      <MonthSummary />

      {/* Fast Action Buttons */}
      <QuickActions />

      {/* Split Grid: Recent Bazaar & Member Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bazaar Section */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-sky-50 text-sky-700 rounded-lg">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  সাম্প্রতিক বাজার খরচ (Recent Bazaar)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('bazaar')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>সব দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {currentBazaar.slice(0, 4).map((b) => {
                const mem = members.find((m) => m.id === b.memberId);
                return (
                  <div key={b.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-800 block truncate max-w-[200px]">
                        {b.description}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {mem?.name || 'অজানা'} • {b.date}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900">{formatTaka(b.amount)}</span>
                  </div>
                );
              })}

              {currentBazaar.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  এই মাসে এখনো কোনো বাজার খরচ যোগ করা হয়নি।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Member Balances Overview */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-50 text-teal-700 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  সদস্য ব্যালেন্স সারাংশ (Members Snapshot)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('members')}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>সদস্য তালিকা</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {activeMembers.slice(0, 4).map((m) => {
                const summary = financialSummary.memberSummaries[m.id];
                const bal = summary?.finalBalance || 0;
                const isRec = bal > 0.009;
                const isPay = bal < -0.009;

                return (
                  <div key={m.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-slate-100 font-bold text-slate-600 flex items-center justify-center text-[10px]">
                        {m.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-slate-800">{m.name}</span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`font-bold ${
                          isRec ? 'text-emerald-600' : isPay ? 'text-rose-600' : 'text-slate-600'
                        }`}
                      >
                        {formatTaka(bal)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {isRec ? 'ফেরত পাবে' : isPay ? 'বকেয়া' : 'সমান'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {activeMembers.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  এখনো কোনো সদস্য যোগ করা হয়নি।
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

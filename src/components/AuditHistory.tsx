import React, { useState, useMemo } from 'react';
import { History, Shield, Filter, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SearchInput } from './SearchInput';

export const AuditHistory: React.FC = () => {
  const { auditEvents } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return auditEvents.filter((ev) => {
      const matchSearch =
        ev.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(ev.details || {}).toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;
      if (typeFilter !== 'all' && ev.entityType !== typeFilter) return false;

      return true;
    });
  }, [auditEvents, searchTerm, typeFilter]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes('create') || action.includes('add') || action.includes('login')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (action.includes('delete') || action.includes('remove')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (action.includes('lock')) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-sky-50 text-sky-700 border-sky-200';
  };

  return (
    <div id="audit-history-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600" />
            <span>সিস্টেম অডিট ট্রেইল (System Audit Log - {filteredEvents.length})</span>
          </h4>
          <p className="text-xs text-slate-500">
            প্রতিটি এন্ট্রি, এডিট, ইউজার অ্যাকাউন্ট পরিবর্তন ও লকিং ক্রিয়াকলাপের অপরিবর্তনীয় রেকর্ড।
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="ব্যবহারকারী, অ্যাকশন বা বিবরণ দিয়ে অনুসন্ধান করুন..."
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
        >
          <option value="all">সকল ক্যাটেগরি</option>
          <option value="auth">লগইন ও সেশন (Auth)</option>
          <option value="meal">মিল আপডেট (Meal)</option>
          <option value="bazaar">বাজার খরচ (Bazaar)</option>
          <option value="universal">ইউনিভার্সাল খরচ (Universal)</option>
          <option value="deposit">জমা (Deposit)</option>
          <option value="member">সদস্য ব্যবস্থাপনা (Member)</option>
          <option value="month">মাস পরিবর্তন ও লক (Month)</option>
          <option value="user_account">ইউজার অ্যাকাউন্ট (User Account)</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold sticky top-0 z-10">
                <th className="py-2.5 px-3">সময়</th>
                <th className="py-2.5 px-3">ব্যবহারকারী</th>
                <th className="py-2.5 px-3">অ্যাকশন</th>
                <th className="py-2.5 px-3">মডিউল</th>
                <th className="py-2.5 px-3">বিস্তারিত বিবরণ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                  <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString('bn-BD', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800">
                    @{ev.username}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadgeColor(
                        ev.action
                      )}`}
                    >
                      {ev.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-600 font-medium">{ev.entityType}</td>
                  <td className="py-2 px-3 text-slate-500 max-w-xs truncate text-[11px]">
                    {ev.details ? JSON.stringify(ev.details) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

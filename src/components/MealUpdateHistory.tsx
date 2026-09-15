import React from 'react';
import { History, ArrowRight, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMeal } from '../utils/calculations';

export const MealUpdateHistory: React.FC = () => {
  const { mealUpdateHistory, activeMonth } = useApp();

  const currentMonthHistory = mealUpdateHistory.filter(
    (item) => item.monthId === activeMonth?.id
  );

  return (
    <div id="meal-update-history-container" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" />
            <span>মিল পরিবর্তনের অডিট হিস্টোরি ({currentMonthHistory.length})</span>
          </h4>
          <p className="text-xs text-slate-500">
            কে, কখন, কোন সদস্যের কত মিল পরিবর্তন করেছেন তার নির্ভরযোগ্য রেকর্ড।
          </p>
        </div>
      </div>

      {currentMonthHistory.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200">
                  <th className="py-2.5 px-3 font-semibold">তারিখ</th>
                  <th className="py-2.5 px-3 font-semibold">সদস্যের নাম</th>
                  <th className="py-2.5 px-3 font-semibold text-center">পরিবর্তন (পূর্বের ➔ নতুন)</th>
                  <th className="py-2.5 px-3 font-semibold">পরিবর্তনকারী</th>
                  <th className="py-2.5 px-3 font-semibold">কারণ / নোট</th>
                  <th className="py-2.5 px-3 font-semibold text-right">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentMonthHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {item.memberName}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 font-mono">
                        <span className="line-through text-slate-400">
                          {formatMeal(item.previousMeal)}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="font-bold text-teal-700">
                          {formatMeal(item.newMeal)}
                        </span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      @{item.changedBy}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate">
                      {item.reason || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(item.changedAt).toLocaleTimeString('bn-BD', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-white rounded-2xl border border-dashed border-slate-200">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500 font-medium">
            এখনো কোনো মিল পরিবর্তন করা হয়নি।
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ক্যালেন্ডারে যে কোনো মিল সংশোধন করা হলে এখানে সম্পূর্ণ ইতিহাস ও কারণ সংরক্ষিত থাকবে।
          </p>
        </div>
      )}
    </div>
  );
};

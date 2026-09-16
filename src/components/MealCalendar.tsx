import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Edit3, History, Utensils, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatMeal } from '../utils/calculations';
import { getDaysInRange } from '../utils/dateUtils';
import { MealUpdateForm } from './MealUpdateForm';
import { MealUpdateHistory } from './MealUpdateHistory';

export const MealCalendar: React.FC = () => {
  const { activeMonth, members, dailyMeals, mealUpdateHistory } = useApp();
  const [selectedMemberId, setSelectedMemberId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'calendar' | 'history'>('calendar');

  // Selected cell for update modal
  const [updatingCell, setUpdatingCell] = useState<{
    memberId: string;
    memberName: string;
    date: string;
    currentMeal: number;
  } | null>(null);

  const activeMembers = useMemo(() => {
    if (!activeMonth) return [];
    return members.filter((m) => !m.isRemoved && m.monthId === activeMonth.id);
  }, [members, activeMonth]);

  // Generate days of active month safely
  const monthDays = useMemo(() => {
    if (!activeMonth) return [];
    return getDaysInRange(activeMonth.startDate, activeMonth.endDate);
  }, [activeMonth]);

  // Map of meals: `${memberId}_${date}` => DailyMeal
  const mealMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const dm of dailyMeals) {
      if (dm.monthId === activeMonth?.id) {
        map[`${dm.memberId}_${dm.date}`] = dm.mealCount;
      }
    }
    return map;
  }, [dailyMeals, activeMonth]);

  // Map of modified days: set of `${memberId}_${date}`
  const modifiedSet = useMemo(() => {
    const set = new Set<string>();
    for (const muh of mealUpdateHistory) {
      if (muh.monthId === activeMonth?.id) {
        set.add(`${muh.memberId}_${muh.date}`);
      }
    }
    return set;
  }, [mealUpdateHistory, activeMonth]);

  const displayedMembers = useMemo(() => {
    if (selectedMemberId === 'all') return activeMembers;
    return activeMembers.filter((m) => m.id === selectedMemberId);
  }, [activeMembers, selectedMemberId]);

  const isLocked = activeMonth?.status === 'locked';

  return (
    <div id="meal-calendar-container" className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">দৈনিক মিল ক্যালেন্ডার (Meal Matrix)</h3>
            <p className="text-xs text-slate-500">দিনভিত্তিক মিল দেখা ও ক্লিক করে দ্রুত পরিবর্তন</p>
          </div>
        </div>

        {/* View Switcher: Calendar vs History */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              id="tab-view-calendar"
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'calendar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ক্যালেন্ডার ছক
            </button>
            <button
              type="button"
              id="tab-view-history"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>পরিবর্তনের ইতিহাস ({mealUpdateHistory.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'history' ? (
        <MealUpdateHistory />
      ) : (
        <div className="space-y-3">
          {/* Member Filter */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedMemberId('all')}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedMemberId === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              সকল সদস্য ({activeMembers.length})
            </button>
            {activeMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMemberId(m.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedMemberId === m.id
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>

          {/* Calendar Table Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 sticky top-0 z-10">
                    <th className="py-2.5 px-3 font-semibold sticky left-0 bg-slate-50 min-w-[140px] shadow-xs">
                      সদস্য
                    </th>
                    {monthDays.map((d) => (
                      <th
                        key={d.dateStr}
                        className="py-2 px-2 text-center font-semibold min-w-[44px] border-l border-slate-200/60"
                      >
                        <div className="text-[11px] font-bold text-slate-800">{d.dayNum}</div>
                        <div className="text-[9px] text-slate-400 font-normal uppercase">{d.dayName}</div>
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-center font-bold sticky right-0 bg-slate-100 min-w-[65px] border-l border-slate-200 shadow-xs">
                      মোট
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedMembers.map((mem) => {
                    let memRowTotal = 0;

                    return (
                      <tr key={mem.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 sticky left-0 bg-white hover:bg-slate-50/70 border-r border-slate-200/60 truncate max-w-[140px]">
                          {mem.name}
                        </td>

                        {monthDays.map((d) => {
                          const key = `${mem.id}_${d.dateStr}`;
                          const mealCount = mealMap[key] ?? 0;
                          memRowTotal += mealCount;
                          const wasUpdated = modifiedSet.has(key);

                          return (
                            <td
                              key={d.dateStr}
                              onClick={() => {
                                if (isLocked) return;
                                setUpdatingCell({
                                  memberId: mem.id,
                                  memberName: mem.name,
                                  date: d.dateStr,
                                  currentMeal: mealCount,
                                });
                              }}
                              className={`py-2 px-1 text-center border-l border-slate-100 transition relative ${
                                isLocked
                                  ? 'cursor-default'
                                  : 'cursor-pointer hover:bg-teal-50 hover:text-teal-900'
                              } ${
                                mealCount > 0
                                  ? 'font-bold text-slate-800'
                                  : 'text-slate-300 font-normal'
                              }`}
                              title={
                                isLocked
                                  ? `${d.dateStr}: ${mealCount} মিল`
                                  : `ক্লিক করে ${d.dateStr}-এর মিল পরিবর্তন করুন`
                              }
                            >
                              <span>{formatMeal(mealCount)}</span>
                              {wasUpdated && (
                                <span
                                  className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-500"
                                  title="এই দিনের মিল পরে পরিবর্তন করা হয়েছে"
                                />
                              )}
                            </td>
                          );
                        })}

                        <td className="py-2.5 px-3 text-center font-bold text-teal-800 sticky right-0 bg-teal-50/50 border-l border-slate-200">
                          {formatMeal(memRowTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  হলুদ বিন্দু: পরবর্তীতে সংশোধিত মিল
                </span>
                <span>• যে কোনো সেলে ক্লিক করে সরাসরি মিল আপডেট করুন</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cell Update Modal */}
      {updatingCell && (
        <MealUpdateForm
          isOpen={true}
          onClose={() => setUpdatingCell(null)}
          memberId={updatingCell.memberId}
          memberName={updatingCell.memberName}
          date={updatingCell.date}
          currentMeal={updatingCell.currentMeal}
        />
      )}
    </div>
  );
};

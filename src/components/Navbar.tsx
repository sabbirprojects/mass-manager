import React, { useState } from 'react';
import { UtensilsCrossed, Calendar, ChevronDown, Plus, LogOut, Shield, User, Lock, Unlock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthSelector } from './MonthSelector';
import { MonthCreateForm } from './MonthCreateForm';

export const Navbar: React.FC = () => {
  const { currentUser, activeMonth, logout } = useApp();
  const [isMonthCreateOpen, setIsMonthCreateOpen] = useState(false);

  return (
    <header id="main-app-header" className="bg-white border-b border-slate-200/90 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity & Month Switcher */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                মেস ম্যানেজার
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.2 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <MonthSelector onOpenNewMonth={() => setIsMonthCreateOpen(true)} />
            </div>
          </div>
        </div>

        {/* Right: Active Month Badge, User Identity & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeMonth && (
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                activeMonth.status === 'locked'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}
            >
              {activeMonth.status === 'locked' ? (
                <Lock className="w-3 h-3 text-amber-600" />
              ) : (
                <Unlock className="w-3 h-3 text-emerald-600" />
              )}
              <span>{activeMonth.status === 'locked' ? 'মাস লকড' : 'সক্রিয়'}</span>
            </div>
          )}

          {/* Current User Info */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                {(currentUser.displayName || currentUser.username).charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.displayName || currentUser.username}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  @{currentUser.username}
                </span>
              </div>
              <button
                id="header-logout-btn"
                type="button"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <MonthCreateForm
        isOpen={isMonthCreateOpen}
        onClose={() => setIsMonthCreateOpen(false)}
      />
    </header>
  );
};

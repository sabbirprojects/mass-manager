import React from 'react';
import {
  LayoutDashboard,
  Users,
  Utensils,
  ShoppingCart,
  FileText,
  Settings,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Navbar } from './Navbar';
import { DashboardView } from './DashboardView';
import { MemberList } from './MemberList';
import { MealCalendar } from './MealCalendar';
import { BazaarSection } from './BazaarSection';
import { ReportsPage } from './ReportsPage';
import { SettingsPage } from './SettingsPage';
import { ToastMessage } from './ToastMessage';
import { ConfirmDialog } from './ConfirmDialog';

export const AppLayout: React.FC = () => {
  const { activeTab, setActiveTab, toasts, confirmModal, closeConfirm } = useApp();

  const navItems: {
    id: 'dashboard' | 'members' | 'meals' | 'bazaar' | 'reports' | 'settings';
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'members', label: 'সদস্য তালিকা', icon: Users },
    { id: 'meals', label: 'দৈনিক মিল', icon: Utensils },
    { id: 'bazaar', label: 'বাজার ও খরচ', icon: ShoppingCart },
    { id: 'reports', label: 'হিসাব ও রিপোর্ট', icon: FileText },
    { id: 'settings', label: 'সেটিংস ও ব্যাকআপ', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans pb-20 sm:pb-8">
      {/* Top Navbar */}
      <Navbar />

      {/* Desktop Main Navigation Tabs */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-20 hidden sm:block no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs sm:text-sm font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'border-teal-600 text-teal-700 bg-teal-50/20'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Primary Page Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'members' && <MemberList />}
        {activeTab === 'meals' && <MealCalendar />}
        {activeTab === 'bazaar' && <BazaarSection />}
        {activeTab === 'reports' && <ReportsPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div
        id="mobile-bottom-nav"
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 sm:hidden flex items-center justify-around py-1.5 px-1 shadow-lg"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center p-1 rounded-xl transition ${
                isActive ? 'text-teal-700 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
              <span className="text-[10px] leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Notifications & Modals */}
      <ToastMessage toasts={toasts} />

      <ConfirmDialog config={confirmModal} onClose={closeConfirm} />
    </div>
  );
};

import React from 'react';
import { LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LogoutButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { logout, openConfirm, session } = useApp();

  const handleLogoutClick = () => {
    openConfirm({
      title: 'লগআউট নিশ্চিতকরণ (Logout)',
      message: `আপনি কি নিশ্চিত যে অ্যাকাউন্ট (@${session?.username}) থেকে লগআউট করতে চান?`,
      confirmLabel: 'লগআউট করুন',
      isDestructive: false,
      onConfirm: () => {
        logout();
      },
    });
  };

  if (compact) {
    return (
      <button
        id="logout-compact-btn"
        type="button"
        onClick={handleLogoutClick}
        title="লগআউট করুন"
        aria-label="Logout"
        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
      >
        <LogOut className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      id="logout-full-btn"
      type="button"
      onClick={handleLogoutClick}
      className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border border-slate-200 rounded-xl transition"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>লগআউট</span>
    </button>
  );
};

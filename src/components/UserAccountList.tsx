import React, { useState } from 'react';
import { Users, UserPlus, Shield, UserX, CheckCircle, Clock, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAccountForm } from './UserAccountForm';

export const UserAccountList: React.FC = () => {
  const { userAccounts, session, deactivateUserAccount, openConfirm } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDeactivate = (userId: string, username: string) => {
    openConfirm({
      title: 'অ্যাকাউন্ট নিষ্ক্রিয়করণ (Deactivate Account)',
      message: `আপনি কি নিশ্চিত যে '${username}' অ্যাকাউন্টটি নিষ্ক্রিয় করতে চান? এই ব্যবহারকারী আর লগইন করতে পারবেন না।`,
      confirmLabel: 'নিষ্ক্রিয় করুন',
      isDestructive: true,
      onConfirm: () => {
        deactivateUserAccount(userId);
      },
    });
  };

  return (
    <div id="user-accounts-container" className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span>ইউজার অ্যাকাউন্টসমূহ ({userAccounts.length})</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি অ্যাকাউন্টের জন্য আলাদা ও সম্পূর্ণ পৃথক মেস ডাটাবেজ সংরক্ষিত।
          </p>
        </div>
        <button
          id="open-add-user-btn"
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>নতুন অ্যাকাউন্ট</span>
        </button>
      </div>

      <div className="grid gap-2.5">
        {userAccounts.map((account) => {
          const isCurrentUser = session?.userId === account.id;

          return (
            <div
              key={account.id}
              id={`user-account-item-${account.username}`}
              className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    account.isActive
                      ? 'bg-teal-100 text-teal-700'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {account.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {account.displayName}
                    </span>
                    <span className="text-xs font-mono text-slate-500">@{account.username}</span>
                    {isCurrentUser && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                        আপনি (Current)
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                    {account.phone && (
                      <span className="flex items-center gap-1 text-slate-600">
                        <Phone className="w-3 h-3 text-teal-600" />
                        {account.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      যোগ হয়েছে: {new Date(account.createdAt).toLocaleDateString('bn-BD')}
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 font-medium ${
                        account.isActive ? 'text-emerald-600' : 'text-rose-500'
                      }`}
                    >
                      {account.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> সক্রিয় (Active)
                        </>
                      ) : (
                        'নিষ্ক্রিয় (Deactivated)'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {!isCurrentUser && account.isActive && (
                  <button
                    type="button"
                    onClick={() => handleDeactivate(account.id, account.username)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition text-xs flex items-center gap-1"
                    title="নিষ্ক্রিয় করুন"
                  >
                    <UserX className="w-4 h-4" />
                    <span className="hidden sm:inline">নিষ্ক্রিয়</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <UserAccountForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
};

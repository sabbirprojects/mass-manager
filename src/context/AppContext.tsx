/**
 * Smart Meal Manager — Central State & Business Logic Provider
 * Encapsulates authentication, multi-account management, month operations,
 * daily meal tracking with history, financial calculations, audit logging,
 * and offline persistence.
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActiveNavTab,
  AppBackupPayload,
  AuditEvent,
  BazaarExpense,
  BazaarExpenseType,
  CalculationMode,
  DailyMeal,
  Deposit,
  MealUpdateHistoryItem,
  Member,
  Month,
  MonthFinancialSummary,
  Session,
  UniversalExpense,
  UserAccount,
} from '../types';
import { computeMonthFinancialSummary, roundToTwo } from '../utils/calculations';
import { generateId, hashPassword, verifyPassword } from '../utils/crypto';
import {
  AppStateData,
  createBackupPayload,
  createDefaultUserWorkspace,
  initializeSeedDataIfEmpty,
  loadAllData,
  loadUserWorkspace,
  saveAllData,
  saveUserWorkspace,
  validateAndRestoreBackup,
  apiFetchUsers,
  apiCreateUser,
  apiLogin,
  apiDeactivateUser,
  safeGetItem,
  STORAGE_KEYS,
} from '../utils/storage';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmConfig {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface AppContextType {
  // Auth & Accounts
  userAccounts: UserAccount[];
  session: Session | null;
  currentUser: Session | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createUserAccount: (username: string, displayName: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  deactivateUserAccount: (userId: string) => Promise<{ success: boolean; error?: string }> | { success: boolean; error?: string };

  // Months
  months: Month[];
  activeMonthId: string | null;
  activeMonth: Month | null;
  setActiveMonthId: (id: string) => void;
  createMonth: (params: {
    name: string;
    startDate: string;
    endDate: string;
    calculationMode: CalculationMode;
    fixedMealRate?: number;
    importPreviousMonthId?: string;
  }) => { success: boolean; error?: string; monthId?: string };
  lockMonth: (monthId: string, reason?: string) => { success: boolean; error?: string };
  unlockMonth: (monthId: string) => { success: boolean; error?: string };
  updateMonthCalculationMode: (
    monthId: string,
    mode: CalculationMode,
    fixedMealRate?: number
  ) => { success: boolean; error?: string };
  refreshState: () => void;

  // Members
  members: Member[];
  addMember: (params: { name: string; phone?: string; previousBalance?: number; initialDeposit?: number }) => { success: boolean; error?: string };
  updateMember: (id: string, params: { name: string; phone?: string; previousBalance?: number; initialDeposit?: number }) => { success: boolean; error?: string };
  removeMember: (id: string) => { success: boolean; error?: string };

  // Daily Meals
  dailyMeals: DailyMeal[];
  mealUpdateHistory: MealUpdateHistoryItem[];
  setDailyMeal: (params: { memberId: string; date: string; mealCount: number; reason?: string }) => { success: boolean; error?: string };
  batchUpdateMealsForDate: (date: string, records: { memberId: string; mealCount: number }[]) => { success: boolean; error?: string };

  // Bazaar Expenses
  bazaarExpenses: BazaarExpense[];
  addBazaarExpense: (params: { memberId: string; date: string; description: string; amount: number; type: BazaarExpenseType }) => { success: boolean; error?: string };
  deleteBazaarExpense: (id: string) => { success: boolean; error?: string };

  // Universal Expenses
  universalExpenses: UniversalExpense[];
  addUniversalExpense: (params: {
    date: string;
    description: string;
    amount: number;
    applicableMemberIds: string[];
    payerMemberId?: string | null;
  }) => { success: boolean; error?: string };
  deleteUniversalExpense: (id: string) => { success: boolean; error?: string };

  // Deposits
  deposits: Deposit[];
  addDeposit: (params: { memberId: string; date: string; amount: number; note?: string }) => { success: boolean; error?: string };
  deleteDeposit: (id: string) => { success: boolean; error?: string };

  // Financial Summary
  financialSummary: MonthFinancialSummary | null;

  // Audit
  auditEvents: AuditEvent[];

  // Navigation
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;

  // UI Toast & Confirm
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  confirmModal: ConfirmConfig;
  openConfirm: (config: Omit<ConfirmConfig, 'isOpen'>) => void;
  closeConfirm: () => void;

  // Backup / Restore
  exportBackup: () => void;
  restoreBackupFile: (file: File) => Promise<{ success: boolean; error?: string }>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const userAccountsRef = React.useRef<UserAccount[]>([]);

  const updateUserAccounts = (accounts: UserAccount[]) => {
    userAccountsRef.current = accounts;
    setUserAccounts(accounts);
  };

  const [session, setSession] = useState<Session | null>(null);
  const [months, setMonths] = useState<Month[]>([]);
  const [activeMonthId, setActiveMonthIdState] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([]);
  const [mealUpdateHistory, setMealUpdateHistory] = useState<MealUpdateHistoryItem[]>([]);
  const [bazaarExpenses, setBazaarExpenses] = useState<BazaarExpense[]>([]);
  const [universalExpenses, setUniversalExpenses] = useState<UniversalExpense[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmModal, setConfirmModal] = useState<ConfirmConfig>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Helper: Toast message
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = generateId('toast');
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // Helper: Confirm dialog
  const openConfirm = (config: Omit<ConfirmConfig, 'isOpen'>) => {
    setConfirmModal({ ...config, isOpen: true });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Helper: Record an Audit Event
  const recordAuditEvent = (
    action: AuditEvent['action'],
    entityType: string,
    details: string,
    entityId?: string
  ) => {
    const actorUserId = session?.userId || 'system';
    const actorUsername = session?.username || 'system';
    const newEvent: AuditEvent = {
      id: generateId('aud'),
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      userId: actorUserId,
      username: actorUsername,
      details,
    };

    setAuditEvents((prev) => {
      const updated = [newEvent, ...prev];
      saveAllData({ auditEvents: updated });
      return updated;
    });
  };

  // 1. Initial Data Load & Central Sync
  useEffect(() => {
    async function init() {
      try {
        const seedData = await initializeSeedDataIfEmpty();
        updateUserAccounts(seedData.userAccounts);

        if (seedData.session) {
          setSession(seedData.session);
          const workspace = loadUserWorkspace(seedData.session.userId, seedData.session.username);
          setMonths(workspace.months);
          setActiveMonthIdState(workspace.activeMonthId);
          setMembers(workspace.members);
          setDailyMeals(workspace.dailyMeals);
          setMealUpdateHistory(workspace.mealUpdateHistory);
          setBazaarExpenses(workspace.bazaarExpenses);
          setUniversalExpenses(workspace.universalExpenses);
          setDeposits(workspace.deposits);
          setAuditEvents(workspace.auditEvents);
        } else {
          setSession(null);
          setMonths([]);
          setActiveMonthIdState(null);
          setMembers([]);
          setDailyMeals([]);
          setMealUpdateHistory([]);
          setBazaarExpenses([]);
          setUniversalExpenses([]);
          setDeposits([]);
          setAuditEvents([]);
        }
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // 2. Cross-Device Synchronization
  // Periodically and on window focus, update user accounts list so registrations from other browsers appear immediately
  useEffect(() => {
    const handleSync = async () => {
      try {
        const freshUsers = await apiFetchUsers();
        if (freshUsers && freshUsers.length > 0) {
          updateUserAccounts(freshUsers);
        }
      } catch {
        // Ignore background sync errors
      }
    };

    window.addEventListener('focus', handleSync);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    const intervalId = setInterval(handleSync, 8000);

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(intervalId);
    };
  }, []);

  const activeMonth = useMemo(() => {
    if (!activeMonthId) return months[0] || null;
    return months.find((m) => m.id === activeMonthId) || months[0] || null;
  }, [months, activeMonthId]);

  const setActiveMonthId = (id: string) => {
    setActiveMonthIdState(id);
    saveAllData({ activeMonthId: id }, session?.userId);
  };

  // Active Month Financial Summary Calculation
  const financialSummary = useMemo<MonthFinancialSummary | null>(() => {
    if (!activeMonth) return null;
    return computeMonthFinancialSummary(
      activeMonth,
      members,
      dailyMeals,
      bazaarExpenses,
      universalExpenses,
      deposits
    );
  }, [activeMonth, members, dailyMeals, bazaarExpenses, universalExpenses, deposits]);

  // Auth Operations
  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername) {
      return { success: false, error: 'ইউজারনেম দিন (Username is required).' };
    }
    if (!password) {
      return { success: false, error: 'পাসওয়ার্ড দিন (Password is required).' };
    }

    // 1. Attempt central API login first (works across all browsers and devices)
    const apiRes = await apiLogin(trimmedUsername, password);
    if (apiRes.success && apiRes.user && apiRes.session) {
      if (apiRes.userAccounts) {
        updateUserAccounts(apiRes.userAccounts);
      }
      setSession(apiRes.session);

      const userWorkspace = apiRes.workspace || loadUserWorkspace(apiRes.user.id, apiRes.user.username);
      setMonths(userWorkspace.months);
      setActiveMonthIdState(userWorkspace.activeMonthId);
      setMembers(userWorkspace.members);
      setDailyMeals(userWorkspace.dailyMeals);
      setMealUpdateHistory(userWorkspace.mealUpdateHistory);
      setBazaarExpenses(userWorkspace.bazaarExpenses);
      setUniversalExpenses(userWorkspace.universalExpenses);
      setDeposits(userWorkspace.deposits);
      setAuditEvents(userWorkspace.auditEvents);

      recordAuditEvent('LOGIN', 'UserAccount', `User ${apiRes.user.username} logged in successfully`, apiRes.user.id);
      showToast(`স্বাগতম, ${apiRes.user.displayName}! লগইন সফল হয়েছে।`, 'success');
      return { success: true };
    }

    if (apiRes.error && apiRes.error !== 'Network error') {
      return { success: false, error: apiRes.error };
    }

    // 2. Offline fallback login check using latest userAccountsRef
    let currentUsers = userAccountsRef.current;
    if (!currentUsers || currentUsers.length === 0) {
      currentUsers = safeGetItem<UserAccount[]>(STORAGE_KEYS.USER_ACCOUNTS, []);
      updateUserAccounts(currentUsers);
    }

    const account = currentUsers.find((u) => u.username.toLowerCase() === trimmedUsername);
    if (!account) {
      return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' };
    }

    if (!account.isActive) {
      return { success: false, error: 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে (Account is deactivated).' };
    }

    const isMatch = await verifyPassword(password, account.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'ভুল ইউজারনেম বা পাসওয়ার্ড (Invalid credentials).' };
    }

    const now = new Date().toISOString();
    const newSession: Session = {
      sessionId: generateId('sess'),
      userId: account.id,
      username: account.username,
      displayName: account.displayName,
      loginAt: now,
      lastActiveAt: now,
    };

    const userWorkspace = loadUserWorkspace(account.id, account.username);
    setMonths(userWorkspace.months);
    setActiveMonthIdState(userWorkspace.activeMonthId);
    setMembers(userWorkspace.members);
    setDailyMeals(userWorkspace.dailyMeals);
    setMealUpdateHistory(userWorkspace.mealUpdateHistory);
    setBazaarExpenses(userWorkspace.bazaarExpenses);
    setUniversalExpenses(userWorkspace.universalExpenses);
    setDeposits(userWorkspace.deposits);
    setAuditEvents(userWorkspace.auditEvents);

    const updatedUsers = currentUsers.map((u) =>
      u.id === account.id ? { ...u, lastLoginAt: now, updatedAt: now } : u
    );

    updateUserAccounts(updatedUsers);
    setSession(newSession);
    saveAllData({ userAccounts: updatedUsers, session: newSession }, account.id);

    recordAuditEvent('LOGIN', 'UserAccount', `User ${account.username} logged in successfully`, account.id);
    showToast(`স্বাগতম, ${account.displayName}! লগইন সফল হয়েছে।`, 'success');
    return { success: true };
  };

  const logout = () => {
    if (session) {
      recordAuditEvent('LOGOUT', 'UserAccount', `User ${session.username} logged out`, session.userId);
    }
    setSession(null);
    setMonths([]);
    setActiveMonthIdState(null);
    setMembers([]);
    setDailyMeals([]);
    setMealUpdateHistory([]);
    setBazaarExpenses([]);
    setUniversalExpenses([]);
    setDeposits([]);
    setAuditEvents([]);
    saveAllData({ session: null });
    showToast('লগআউট সম্পন্ন হয়েছে (Logged out).', 'info');
  };

  const createUserAccount = async (
    username: string,
    displayName: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'ইউজারনেম কমপক্ষে ৩ অক্ষরের হতে হবে।' };
    }
    if (!displayName.trim()) {
      return { success: false, error: 'ডিসপ্লে নাম দিন।' };
    }
    if (!password || password.length < 4) {
      return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' };
    }

    const currentUsers = userAccountsRef.current;
    const exists = currentUsers.some((u) => u.username.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, error: 'এই ইউজারনেম ইতিমধ্যে বিদ্যমান (Username already exists)।' };
    }

    // 1. Attempt central API creation
    const apiRes = await apiCreateUser({
      username: cleanUsername,
      displayName: displayName.trim(),
      password,
      phone: phone?.trim() || undefined,
      createdBy: session?.username || 'system',
    });

    if (apiRes.success && apiRes.user) {
      const updated = apiRes.userAccounts || [...userAccountsRef.current, apiRes.user];
      updateUserAccounts(updated);
      recordAuditEvent('CREATE_USER', 'UserAccount', `New authorized user ${cleanUsername} created`, apiRes.user.id);
      showToast(`নতুন ব্যবহারকারী '${cleanUsername}' যোগ করা হয়েছে!`, 'success');
      return { success: true };
    }

    if (apiRes.error && apiRes.error !== 'Network error') {
      return { success: false, error: apiRes.error };
    }

    // 2. Offline fallback creation
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const newUser: UserAccount = {
      id: generateId('usr'),
      username: cleanUsername,
      displayName: displayName.trim(),
      phone: phone?.trim() || undefined,
      passwordHash,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      createdBy: session?.username || 'system',
      updatedBy: session?.username || 'system',
    };

    createDefaultUserWorkspace(newUser.id, newUser.username);

    const updated = [...userAccountsRef.current, newUser];
    updateUserAccounts(updated);
    saveAllData({ userAccounts: updated });

    recordAuditEvent('CREATE_USER', 'UserAccount', `New authorized user ${cleanUsername} created`, newUser.id);
    showToast(`নতুন ব্যবহারকারী '${cleanUsername}' যোগ করা হয়েছে!`, 'success');
    return { success: true };
  };

  const deactivateUserAccount = async (userId: string): Promise<{ success: boolean; error?: string }> => {
    const currentUsers = userAccountsRef.current;
    const activeCount = currentUsers.filter((u) => u.isActive).length;
    if (activeCount <= 1) {
      return { success: false, error: 'কমপক্ষে একটি সক্রিয় অ্যাকাউন্ট থাকা বাধ্যতামূলক।' };
    }

    if (session?.userId === userId) {
      return { success: false, error: 'নিজের বর্তমান লগইন করা অ্যাকাউন্ট নিষ্ক্রিয় করা যাবে না।' };
    }

    const targetUser = currentUsers.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'ব্যবহারকারী খুঁজে পাওয়া যায়নি।' };

    const apiRes = await apiDeactivateUser(userId, session?.userId);
    if (apiRes.success && apiRes.userAccounts) {
      updateUserAccounts(apiRes.userAccounts);
    } else {
      const updated = currentUsers.map((u) =>
        u.id === userId ? { ...u, isActive: false, updatedAt: new Date().toISOString() } : u
      );
      updateUserAccounts(updated);
      saveAllData({ userAccounts: updated });
    }

    recordAuditEvent('DEACTIVATE_USER', 'UserAccount', `Deactivated user account ${targetUser.username}`, userId);
    showToast(`ব্যবহারকারী '${targetUser.username}' নিষ্ক্রিয় করা হয়েছে।`, 'info');
    return { success: true };
  };


  // Month Operations
  const createMonth = (params: {
    name: string;
    startDate: string;
    endDate: string;
    calculationMode: CalculationMode;
    fixedMealRate?: number;
    importPreviousMonthId?: string;
  }): { success: boolean; error?: string; monthId?: string } => {
    if (!session) return { success: false, error: 'অনুগ্রহ করে প্রথমে লগইন করুন।' };
    if (!params.name.trim()) return { success: false, error: 'মাসের নাম আবশ্যক।' };
    if (!params.startDate || !params.endDate) return { success: false, error: 'শুরু এবং শেষের তারিখ আবশ্যক।' };
    if (params.endDate < params.startDate) return { success: false, error: 'শেষের তারিখ শুরুর আগে হতে পারে না।' };

    const start = new Date(params.startDate);
    const end = new Date(params.endDate);
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const monthId = generateId('month');
    const now = new Date().toISOString();

    const newMonth: Month = {
      id: monthId,
      name: params.name.trim(),
      startDate: params.startDate,
      endDate: params.endDate,
      totalDays,
      status: 'active',
      calculationMode: params.calculationMode,
      fixedMealRate: params.fixedMealRate || 60,
      avgMealAdjustmentEnabled: false,
      lockedAt: null,
      unlockedAt: null,
      lockedBy: null,
      lockReason: null,
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    let newMembersToAdd: Member[] = [];
    if (params.importPreviousMonthId) {
      // Calculate final balances from that month to carry forward
      const prevMonth = months.find((m) => m.id === params.importPreviousMonthId);
      if (prevMonth) {
        const prevSummary = computeMonthFinancialSummary(
          prevMonth,
          members,
          dailyMeals,
          bazaarExpenses,
          universalExpenses,
          deposits
        );

        const prevActiveMembers = members.filter((m) => m.monthId === prevMonth.id && !m.isRemoved);
        newMembersToAdd = prevActiveMembers.map((pm) => {
          const finalBal = prevSummary.memberSummaries[pm.id]?.finalBalance || 0;
          return {
            id: generateId('mem'),
            monthId,
            name: pm.name,
            phone: pm.phone,
            previousBalance: finalBal, // Carry-forward into previousBalance
            initialDeposit: 0,
            isRemoved: false,
            createdAt: now,
            updatedAt: now,
            createdBy: session.username,
            updatedBy: session.username,
          };
        });
      }
    }

    const updatedMonths = [newMonth, ...months];
    const updatedMembers = [...members, ...newMembersToAdd];

    setMonths(updatedMonths);
    setMembers(updatedMembers);
    setActiveMonthIdState(monthId);

    saveAllData({
      months: updatedMonths,
      members: updatedMembers,
      activeMonthId: monthId,
    });

    recordAuditEvent(
      'CREATE_MONTH',
      'Month',
      `Created month '${newMonth.name}' with ${newMembersToAdd.length} imported members`,
      monthId
    );
    showToast(`নতুন মাস '${newMonth.name}' সফলভাবে তৈরি হয়েছে!`, 'success');

    return { success: true, monthId };
  };

  const lockMonth = (monthId: string, reason?: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    const target = months.find((m) => m.id === monthId);
    if (!target) return { success: false, error: 'মাস খুঁজে পাওয়া যায়নি।' };
    if (target.status === 'locked') return { success: false, error: 'মাসটি ইতিমধ্যে লক করা।' };

    const now = new Date().toISOString();
    const updated = months.map((m) =>
      m.id === monthId
        ? {
            ...m,
            status: 'locked' as const,
            lockedAt: now,
            lockedBy: session.username,
            lockReason: reason || 'মাসিক হিসাব সমাপ্ত ও নিশ্চিত করা হয়েছে',
            updatedAt: now,
            updatedBy: session.username,
          }
        : m
    );

    setMonths(updated);
    saveAllData({ months: updated });

    recordAuditEvent('LOCK_MONTH', 'Month', `Locked month ${target.name}. Reason: ${reason || 'N/A'}`, monthId);
    showToast(`মাস '${target.name}' লক করা হয়েছে।`, 'info');
    return { success: true };
  };

  const unlockMonth = (monthId: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    const target = months.find((m) => m.id === monthId);
    if (!target) return { success: false, error: 'মাস খুঁজে পাওয়া যায়নি।' };

    const now = new Date().toISOString();
    const updated = months.map((m) =>
      m.id === monthId
        ? {
            ...m,
            status: 'active' as const,
            unlockedAt: now,
            updatedAt: now,
            updatedBy: session.username,
          }
        : m
    );

    setMonths(updated);
    saveAllData({ months: updated });

    recordAuditEvent('UNLOCK_MONTH', 'Month', `Unlocked month ${target.name} for editing`, monthId);
    showToast(`মাস '${target.name}' সফলভাবে আনলক করা হয়েছে।`, 'success');
    return { success: true };
  };

  const updateMonthCalculationMode = (
    monthId: string,
    mode: CalculationMode,
    fixedMealRate?: number
  ): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    const target = months.find((m) => m.id === monthId);
    if (!target) return { success: false, error: 'মাসটি খুঁজে পাওয়া যায়নি।' };

    const now = new Date().toISOString();
    const updated = months.map((m) =>
      m.id === monthId
        ? {
            ...m,
            calculationMode: mode,
            fixedMealRate: fixedMealRate !== undefined ? fixedMealRate : m.fixedMealRate,
            updatedAt: now,
            updatedBy: session.username,
          }
        : m
    );

    setMonths(updated);
    saveAllData({ months: updated });

    recordAuditEvent('UPDATE_MONTH', 'Month', `Updated calculation mode to ${mode}`, monthId);
    showToast('হিসাব গণনা মোড সফলভাবে সংরক্ষিত হয়েছে।', 'success');
    return { success: true };
  };

  const refreshState = () => {
    const data = loadAllData(session?.userId, session?.username);
    updateUserAccounts(data.userAccounts);
    if (data.session) {
      setSession(data.session);
    }
    setMonths(data.months);
    setActiveMonthIdState(data.activeMonthId);
    setMembers(data.members);
    setDailyMeals(data.dailyMeals);
    setMealUpdateHistory(data.mealUpdateHistory);
    setBazaarExpenses(data.bazaarExpenses);
    setUniversalExpenses(data.universalExpenses);
    setDeposits(data.deposits);
    setAuditEvents(data.auditEvents);
  };

  // Member Management
  const addMember = (params: {
    name: string;
    phone?: string;
    previousBalance?: number;
    initialDeposit?: number;
  }): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'কোনো সক্রিয় মাস নির্বাচন করা নেই।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে নতুন সদস্য যোগ করা যাবে না।' };
    }
    if (!params.name.trim()) {
      return { success: false, error: 'সদস্যের নাম লিখুন।' };
    }

    const now = new Date().toISOString();
    const newMember: Member = {
      id: generateId('mem'),
      monthId: activeMonth.id,
      name: params.name.trim(),
      phone: params.phone?.trim() || '',
      previousBalance: roundToTwo(Number(params.previousBalance) || 0),
      initialDeposit: roundToTwo(Number(params.initialDeposit) || 0),
      isRemoved: false,
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    const updated = [...members, newMember];
    setMembers(updated);
    saveAllData({ members: updated });

    recordAuditEvent('ADD_MEMBER', 'Member', `Added member ${newMember.name}`, newMember.id);
    showToast(`সদস্য '${newMember.name}' যুক্ত হয়েছে।`, 'success');
    return { success: true };
  };

  const updateMember = (
    id: string,
    params: { name: string; phone?: string; previousBalance?: number; initialDeposit?: number }
  ): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (activeMonth?.status === 'locked') {
      return { success: false, error: 'লক করা মাসে সদস্য তথ্য সংশোধন করা যাবে না।' };
    }
    if (!params.name.trim()) {
      return { success: false, error: 'নাম খালি হতে পারবে না।' };
    }

    const now = new Date().toISOString();
    const updated = members.map((m) =>
      m.id === id
        ? {
            ...m,
            name: params.name.trim(),
            phone: params.phone !== undefined ? params.phone.trim() : m.phone,
            previousBalance:
              params.previousBalance !== undefined
                ? roundToTwo(Number(params.previousBalance) || 0)
                : m.previousBalance,
            initialDeposit:
              params.initialDeposit !== undefined
                ? roundToTwo(Number(params.initialDeposit) || 0)
                : m.initialDeposit,
            updatedAt: now,
            updatedBy: session.username,
          }
        : m
    );

    setMembers(updated);
    saveAllData({ members: updated });

    recordAuditEvent('UPDATE_MEMBER', 'Member', `Updated member ${params.name}`, id);
    showToast('সদস্যের তথ্য আপডেট হয়েছে।', 'success');
    return { success: true };
  };

  const removeMember = (id: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (activeMonth?.status === 'locked') {
      return { success: false, error: 'লক করা মাসে সদস্য রিমুভ করা যাবে না।' };
    }

    const target = members.find((m) => m.id === id);
    if (!target) return { success: false, error: 'সদস্য খুঁজে পাওয়া যায়নি।' };

    // Soft delete
    const now = new Date().toISOString();
    const updated = members.map((m) =>
      m.id === id ? { ...m, isRemoved: true, updatedAt: now, updatedBy: session.username } : m
    );

    setMembers(updated);
    saveAllData({ members: updated });

    recordAuditEvent('REMOVE_MEMBER', 'Member', `Removed member ${target.name}`, id);
    showToast(`সদস্য '${target.name}' রিমুভ করা হয়েছে।`, 'info');
    return { success: true };
  };

  // Daily Meal Management
  const setDailyMeal = (params: {
    memberId: string;
    date: string;
    mealCount: number;
    reason?: string;
  }): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'সক্রিয় মাস নির্বাচন করুন।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে মিল পরিবর্তন করা যাবে না।' };
    }

    const targetMember = members.find((m) => m.id === params.memberId);
    if (!targetMember) return { success: false, error: 'সদস্য খুঁজে পাওয়া যায়নি।' };

    const count = Math.max(0, roundToTwo(Number(params.mealCount) || 0));
    const now = new Date().toISOString();

    const existingIndex = dailyMeals.findIndex(
      (dm) => dm.monthId === activeMonth.id && dm.memberId === params.memberId && dm.date === params.date
    );

    let updatedMeals = [...dailyMeals];
    let updatedHistory = [...mealUpdateHistory];

    if (existingIndex >= 0) {
      const existing = dailyMeals[existingIndex];
      if (existing.mealCount !== count) {
        // Record update audit history item
        const historyItem: MealUpdateHistoryItem = {
          id: generateId('muh'),
          monthId: activeMonth.id,
          memberId: params.memberId,
          memberName: targetMember.name,
          date: params.date,
          previousMeal: existing.mealCount,
          newMeal: count,
          changedAt: now,
          changedBy: session.username,
          reason: params.reason || undefined,
        };
        updatedHistory = [historyItem, ...mealUpdateHistory];

        updatedMeals[existingIndex] = {
          ...existing,
          mealCount: count,
          updatedAt: now,
          updatedBy: session.username,
        };

        recordAuditEvent(
          'UPDATE_DAILY_MEAL',
          'DailyMeal',
          `Updated meal for ${targetMember.name} on ${params.date} from ${existing.mealCount} to ${count}${params.reason ? ` (Reason: ${params.reason})` : ''}`,
          existing.id
        );
      }
    } else {
      const newMeal: DailyMeal = {
        id: generateId('dm'),
        monthId: activeMonth.id,
        memberId: params.memberId,
        date: params.date,
        mealCount: count,
        createdAt: now,
        updatedAt: now,
        createdBy: session.username,
        updatedBy: session.username,
      };
      updatedMeals.push(newMeal);

      recordAuditEvent(
        'SET_DAILY_MEAL',
        'DailyMeal',
        `Set daily meal for ${targetMember.name} on ${params.date} to ${count}`,
        newMeal.id
      );
    }

    setDailyMeals(updatedMeals);
    setMealUpdateHistory(updatedHistory);
    saveAllData({ dailyMeals: updatedMeals, mealUpdateHistory: updatedHistory });

    return { success: true };
  };

  const batchUpdateMealsForDate = (
    date: string,
    records: { memberId: string; mealCount: number }[]
  ): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'সক্রিয় মাস নির্বাচন করুন।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে মিল পরিবর্তন করা যাবে না।' };
    }

    const now = new Date().toISOString();
    let updatedMeals = [...dailyMeals];
    let updatedHistory = [...mealUpdateHistory];

    for (const rec of records) {
      const targetMember = members.find((m) => m.id === rec.memberId);
      if (!targetMember) continue;
      const count = Math.max(0, roundToTwo(Number(rec.mealCount) || 0));

      const existingIndex = updatedMeals.findIndex(
        (dm) => dm.monthId === activeMonth.id && dm.memberId === rec.memberId && dm.date === date
      );

      if (existingIndex >= 0) {
        const existing = updatedMeals[existingIndex];
        if (existing.mealCount !== count) {
          updatedHistory.unshift({
            id: generateId('muh'),
            monthId: activeMonth.id,
            memberId: rec.memberId,
            memberName: targetMember.name,
            date,
            previousMeal: existing.mealCount,
            newMeal: count,
            changedAt: now,
            changedBy: session.username,
            reason: 'Quick Daily Entry',
          });

          updatedMeals[existingIndex] = {
            ...existing,
            mealCount: count,
            updatedAt: now,
            updatedBy: session.username,
          };
        }
      } else {
        updatedMeals.push({
          id: generateId('dm'),
          monthId: activeMonth.id,
          memberId: rec.memberId,
          date,
          mealCount: count,
          createdAt: now,
          updatedAt: now,
          createdBy: session.username,
          updatedBy: session.username,
        });
      }
    }

    setDailyMeals(updatedMeals);
    setMealUpdateHistory(updatedHistory);
    saveAllData({ dailyMeals: updatedMeals, mealUpdateHistory: updatedHistory });

    recordAuditEvent(
      'UPDATE_DAILY_MEAL',
      'DailyMeal',
      `Batch updated daily meals for date ${date} (${records.length} members)`
    );
    showToast(`${date} তারিখের মিল সংরক্ষিত হয়েছে।`, 'success');
    return { success: true };
  };

  // Bazaar Expenses
  const addBazaarExpense = (params: {
    memberId: string;
    date: string;
    description: string;
    amount: number;
    type: BazaarExpenseType;
  }): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'সক্রিয় মাস নির্বাচন করুন।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে বাজার খরচ যোগ করা যাবে না।' };
    }
    if (!params.memberId) return { success: false, error: 'বাজারকারী সদস্য নির্বাচন করুন।' };
    if (params.amount === undefined || isNaN(params.amount) || params.amount === 0) {
      return { success: false, error: 'সঠিক টাকার পরিমাণ লিখুন (০ ব্যতীত)।' };
    }

    const member = members.find((m) => m.id === params.memberId);
    const now = new Date().toISOString();
    const isNegative = params.amount < 0;
    const newExpense: BazaarExpense = {
      id: generateId('baz'),
      monthId: activeMonth.id,
      memberId: params.memberId,
      date: params.date,
      description: params.description.trim() || (isNegative ? 'Shared Funds Bazaar' : 'General Bazaar'),
      amount: roundToTwo(params.amount),
      type: params.type,
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    const updated = [newExpense, ...bazaarExpenses];
    setBazaarExpenses(updated);
    saveAllData({ bazaarExpenses: updated });

    if (isNegative) {
      recordAuditEvent(
        'ADD_BAZAAR',
        'BazaarExpense',
        `Added shared funds bazaar ৳${Math.abs(newExpense.amount)} (${newExpense.description}) deducted from ${member?.name || 'Member'}'s deposit`,
        newExpense.id
      );
      showToast(`শেয়ার্ড ফান্ড বাজার ৳${Math.abs(newExpense.amount)} যুক্ত হয়েছে (${member?.name || 'সদস্য'}-এর ডিপোজিট থেকে কর্তন)!`, 'success');
    } else {
      recordAuditEvent(
        'ADD_BAZAAR',
        'BazaarExpense',
        `Added bazaar ৳${newExpense.amount} (${newExpense.description}) by ${member?.name || 'Unknown'}`,
        newExpense.id
      );
      showToast(`বাজার খরচ ৳${newExpense.amount} সফলভাবে যুক্ত হয়েছে!`, 'success');
    }
    return { success: true };
  };

  const deleteBazaarExpense = (id: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (activeMonth?.status === 'locked') {
      return { success: false, error: 'লক করা মাসে খরচ মুছে ফেলা যাবে না।' };
    }

    const target = bazaarExpenses.find((b) => b.id === id);
    if (!target) return { success: false, error: 'খরচ খুঁজে পাওয়া যায়নি।' };

    const updated = bazaarExpenses.filter((b) => b.id !== id);
    setBazaarExpenses(updated);
    saveAllData({ bazaarExpenses: updated });

    recordAuditEvent('DELETE_BAZAAR', 'BazaarExpense', `Deleted bazaar expense ৳${target.amount}`, id);
    showToast('বাজার খরচ মুছে ফেলা হয়েছে।', 'info');
    return { success: true };
  };

  // Universal Expenses
  const addUniversalExpense = (params: {
    date: string;
    description: string;
    amount: number;
    applicableMemberIds: string[];
    payerMemberId?: string | null;
  }): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'সক্রিয় মাস নির্বাচন করুন।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে ইউনিভার্সাল খরচ যোগ করা যাবে না।' };
    }
    if (!params.amount || params.amount <= 0) return { success: false, error: 'সঠিক টাকার পরিমাণ দিন।' };
    if (!params.applicableMemberIds || params.applicableMemberIds.length === 0) {
      return { success: false, error: 'অন্তত একজন সদস্য নির্বাচন করা আবশ্যক।' };
    }

    const perShare = roundToTwo(params.amount / params.applicableMemberIds.length);
    const now = new Date().toISOString();
    const payerMember = params.payerMemberId ? members.find((m) => m.id === params.payerMemberId) : null;
    const newUni: UniversalExpense = {
      id: generateId('uni'),
      monthId: activeMonth.id,
      date: params.date,
      description: params.description.trim() || 'Universal Expense',
      amount: roundToTwo(params.amount),
      applicableMemberIds: params.applicableMemberIds,
      perMemberShare: perShare,
      payerMemberId: params.payerMemberId || null,
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    const updated = [newUni, ...universalExpenses];
    setUniversalExpenses(updated);
    saveAllData({ universalExpenses: updated });

    const payerInfo = payerMember ? ` (পরিশোধকারী: ${payerMember.name} কে সরাসরি ক্রেডিট)` : '';
    recordAuditEvent(
      'ADD_UNIVERSAL',
      'UniversalExpense',
      `Added universal expense ৳${newUni.amount} (${newUni.description}) shared by ${newUni.applicableMemberIds.length} members${payerInfo}`,
      newUni.id
    );
    showToast(
      `ইউনিভার্সাল খরচ ৳${newUni.amount} যুক্ত হয়েছে (মাথাপিছু ৳${perShare})${
        payerMember ? ` এবং ${payerMember.name}-এর অ্যাকাউন্টে জমা হয়েছে` : ''
      }।`,
      'success'
    );
    return { success: true };
  };

  const deleteUniversalExpense = (id: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (activeMonth?.status === 'locked') {
      return { success: false, error: 'লক করা মাসে খরচ মুছে ফেলা যাবে না।' };
    }

    const target = universalExpenses.find((u) => u.id === id);
    if (!target) return { success: false, error: 'খরচ খুঁজে পাওয়া যায়নি।' };

    const updated = universalExpenses.filter((u) => u.id !== id);
    setUniversalExpenses(updated);
    saveAllData({ universalExpenses: updated });

    recordAuditEvent('DELETE_UNIVERSAL', 'UniversalExpense', `Deleted universal expense ৳${target.amount}`, id);
    showToast('ইউনিভার্সাল খরচ মুছে ফেলা হয়েছে।', 'info');
    return { success: true };
  };

  // Deposits
  const addDeposit = (params: {
    memberId: string;
    date: string;
    amount: number;
    note?: string;
  }): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (!activeMonth) return { success: false, error: 'সক্রিয় মাস নির্বাচন করুন।' };
    if (activeMonth.status === 'locked') {
      return { success: false, error: 'লক করা মাসে জমা টাকা যোগ করা যাবে না।' };
    }
    if (!params.memberId) return { success: false, error: 'সদস্য নির্বাচন করুন।' };
    if (!params.amount || params.amount <= 0) return { success: false, error: 'সঠিক জমার পরিমাণ দিন।' };

    const member = members.find((m) => m.id === params.memberId);
    const now = new Date().toISOString();
    const newDep: Deposit = {
      id: generateId('dep'),
      monthId: activeMonth.id,
      memberId: params.memberId,
      date: params.date,
      amount: roundToTwo(params.amount),
      note: params.note?.trim() || '',
      createdAt: now,
      updatedAt: now,
      createdBy: session.username,
      updatedBy: session.username,
    };

    const updated = [newDep, ...deposits];
    setDeposits(updated);
    saveAllData({ deposits: updated });

    recordAuditEvent(
      'ADD_DEPOSIT',
      'Deposit',
      `Added deposit ৳${newDep.amount} for ${member?.name || 'Member'}`,
      newDep.id
    );
    showToast(`জমা ৳${newDep.amount} সফলভাবে যুক্ত হয়েছে!`, 'success');
    return { success: true };
  };

  const deleteDeposit = (id: string): { success: boolean; error?: string } => {
    if (!session) return { success: false, error: 'লগইন আবশ্যক।' };
    if (activeMonth?.status === 'locked') {
      return { success: false, error: 'লক করা মাসে জমা এন্ট্রি মুছে ফেলা যাবে না।' };
    }

    const target = deposits.find((d) => d.id === id);
    if (!target) return { success: false, error: 'জমা এন্ট্রি খুঁজে পাওয়া যায়নি।' };

    const updated = deposits.filter((d) => d.id !== id);
    setDeposits(updated);
    saveAllData({ deposits: updated });

    recordAuditEvent('DELETE_DEPOSIT', 'Deposit', `Deleted deposit entry ৳${target.amount}`, id);
    showToast('জমা এন্ট্রি মুছে ফেলা হয়েছে।', 'info');
    return { success: true };
  };

  // Backup & Restore
  const exportBackup = () => {
    const backup = createBackupPayload(session?.username || 'anonymous', session?.userId);
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Meal_Manager_${session?.username || 'user'}_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    recordAuditEvent('BACKUP_CREATED', 'System', 'Exported JSON backup file');
    showToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে!', 'success');
  };

  const restoreBackupFile = async (file: File): Promise<{ success: boolean; error?: string }> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const result = validateAndRestoreBackup(parsed, session?.username || 'user', session?.userId);

      if (!result.success || !result.restoredData) {
        return { success: false, error: result.error || 'ব্যাকআপ ফাইলটি সঠিক নয়।' };
      }

      // Reload local React state from restored data
      updateUserAccounts(result.restoredData.userAccounts);
      setSession(null); // Require clean re-login

      // Sync restore to central server
      fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: parsed, userId: session?.userId }),
      }).catch((e) => console.warn('Sync restore to server failed:', e));
      setMonths(result.restoredData.months);
      setActiveMonthIdState(result.restoredData.activeMonthId);
      setMembers(result.restoredData.members);
      setDailyMeals(result.restoredData.dailyMeals);
      setMealUpdateHistory(result.restoredData.mealUpdateHistory);
      setBazaarExpenses(result.restoredData.bazaarExpenses);
      setUniversalExpenses(result.restoredData.universalExpenses);
      setDeposits(result.restoredData.deposits);
      setAuditEvents(result.restoredData.auditEvents);

      showToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে! অনুগ্রহ করে পুনরায় লগইন করুন।', 'success');
      return { success: true };
    } catch (err) {
      console.error('Failed to parse backup:', err);
      return { success: false, error: 'ফাইলটি পড়তে ব্যর্থ হয়েছে। অনুগ্রহ করে সঠিক JSON ফাইল নির্বাচন করুন।' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        userAccounts,
        session,
        currentUser: session,
        isLoading,
        login,
        logout,
        createUserAccount,
        deactivateUserAccount,
        months,
        activeMonthId,
        activeMonth,
        setActiveMonthId,
        createMonth,
        lockMonth,
        unlockMonth,
        updateMonthCalculationMode,
        refreshState,
        members,
        addMember,
        updateMember,
        removeMember,
        dailyMeals,
        mealUpdateHistory,
        setDailyMeal,
        batchUpdateMealsForDate,
        bazaarExpenses,
        addBazaarExpense,
        deleteBazaarExpense,
        universalExpenses,
        addUniversalExpense,
        deleteUniversalExpense,
        deposits,
        addDeposit,
        deleteDeposit,
        financialSummary,
        auditEvents,
        activeTab,
        setActiveTab,
        toasts,
        showToast,
        confirmModal,
        openConfirm,
        closeConfirm,
        exportBackup,
        restoreBackupFile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

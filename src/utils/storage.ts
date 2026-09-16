/**
 * Smart Meal Manager — Persistence & Backup Storage Layer
 * Offline-first localStorage with schema versioning, atomic writes, and data recovery.
 */

import {
  AppBackupPayload,
  AuditEvent,
  BazaarExpense,
  DailyMeal,
  Deposit,
  MealUpdateHistoryItem,
  Member,
  Month,
  Session,
  UniversalExpense,
  UserAccount,
} from '../types';
import { generateId, hashPassword } from './crypto';

export const CURRENT_SCHEMA_VERSION = 1;
export const APP_VERSION = '1.0.0';

const STORAGE_KEYS = {
  SCHEMA_VERSION: 'smm_schema_version',
  USER_ACCOUNTS: 'smm_user_accounts',
  SESSION: 'smm_active_session',
  MONTHS: 'smm_months',
  ACTIVE_MONTH_ID: 'smm_active_month_id',
  MEMBERS: 'smm_members',
  DAILY_MEALS: 'smm_daily_meals',
  MEAL_UPDATE_HISTORY: 'smm_meal_update_history',
  BAZAAR_EXPENSES: 'smm_bazaar_expenses',
  UNIVERSAL_EXPENSES: 'smm_universal_expenses',
  DEPOSITS: 'smm_deposits',
  AUDIT_EVENTS: 'smm_audit_events',
};

export interface UserWorkspaceData {
  months: Month[];
  activeMonthId: string | null;
  members: Member[];
  dailyMeals: DailyMeal[];
  mealUpdateHistory: MealUpdateHistoryItem[];
  bazaarExpenses: BazaarExpense[];
  universalExpenses: UniversalExpense[];
  deposits: Deposit[];
  auditEvents: AuditEvent[];
}

export interface AppStateData extends UserWorkspaceData {
  userAccounts: UserAccount[];
  session: Session | null;
}

function safeGetItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function safeSetItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

/**
 * Initializes default demo data if the application is accessed for the first time.
 */
export async function initializeSeedDataIfEmpty(): Promise<AppStateData> {
  const existingUsers = safeGetItem<UserAccount[]>(STORAGE_KEYS.USER_ACCOUNTS, []);

  if (existingUsers.length > 0) {
    return loadAllData();
  }

  // Generate initial demo users with hashed passwords
  const passwordHash = await hashPassword('mess1234');
  const now = new Date().toISOString();

  const user1: UserAccount = {
    id: 'usr_sabbir_01',
    username: 'sabbir',
    displayName: 'Sabbir Hossain (সাব্বির)',
    passwordHash,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    createdBy: 'system',
    updatedBy: 'system',
  };

  const user2: UserAccount = {
    id: 'usr_tanvir_02',
    username: 'tanvir',
    displayName: 'Tanvir Ahmed (তানভীর)',
    passwordHash,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
    createdBy: 'system',
    updatedBy: 'system',
  };

  const initialUsers = [user1, user2];

  // Initial Month: Current Month (September 2026)
  const monthId = 'month_sep_2026';
  const initialMonth: Month = {
    id: monthId,
    name: 'September 2026 (সেপ্টেম্বর ২০২৬)',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
    totalDays: 30,
    status: 'active',
    calculationMode: 'auto',
    fixedMealRate: 65,
    avgMealAdjustmentEnabled: false,
    lockedAt: null,
    unlockedAt: null,
    lockedBy: null,
    lockReason: null,
    createdAt: now,
    updatedAt: now,
    createdBy: 'sabbir',
    updatedBy: 'sabbir',
  };

  // Initial Members
  const memberNames = [
    { id: 'mem_1', name: 'Sabbir Hossain (সাব্বির)', prevBal: 450, deposit: 3000 },
    { id: 'mem_2', name: 'Tanvir Ahmed (তানভীর)', prevBal: -200, deposit: 3500 },
    { id: 'mem_3', name: 'Rakib Hasan (রাকিব)', prevBal: 120, deposit: 3000 },
    { id: 'mem_4', name: 'Faisal Mahmud (ফয়সাল)', prevBal: -500, deposit: 4000 },
    { id: 'mem_5', name: 'Naimur Rahman (নাঈমুর)', prevBal: 0, deposit: 2500 },
  ];

  const initialMembers: Member[] = memberNames.map((m) => ({
    id: m.id,
    monthId,
    name: m.name,
    previousBalance: m.prevBal,
    initialDeposit: m.deposit,
    isRemoved: false,
    createdAt: now,
    updatedAt: now,
    createdBy: 'sabbir',
    updatedBy: 'sabbir',
  }));

  // Initial Daily Meals for first 15 days
  const initialMeals: DailyMeal[] = [];
  for (let day = 1; day <= 15; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `2026-09-${dayStr}`;

    initialMeals.push(
      { id: `dm_1_${day}`, monthId, memberId: 'mem_1', date: dateStr, mealCount: 2, createdAt: now, updatedAt: now, createdBy: 'sabbir', updatedBy: 'sabbir' },
      { id: `dm_2_${day}`, monthId, memberId: 'mem_2', date: dateStr, mealCount: 3, createdAt: now, updatedAt: now, createdBy: 'sabbir', updatedBy: 'sabbir' },
      { id: `dm_3_${day}`, monthId, memberId: 'mem_3', date: dateStr, mealCount: 2, createdAt: now, updatedAt: now, createdBy: 'sabbir', updatedBy: 'sabbir' },
      { id: `dm_4_${day}`, monthId, memberId: 'mem_4', date: dateStr, mealCount: 2.5, createdAt: now, updatedAt: now, createdBy: 'sabbir', updatedBy: 'sabbir' },
      { id: `dm_5_${day}`, monthId, memberId: 'mem_5', date: dateStr, mealCount: 1.5, createdAt: now, updatedAt: now, createdBy: 'sabbir', updatedBy: 'sabbir' }
    );
  }

  // Initial Bazaar Expenses (General bazaar)
  const initialBazaar: BazaarExpense[] = [
    {
      id: 'baz_1',
      monthId,
      memberId: 'mem_1',
      date: '2026-09-02',
      description: 'Rice, Lentils, Oil (চাল, ডাল, তেল)',
      amount: 2850,
      type: 'groceries',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sabbir',
      updatedBy: 'sabbir',
    },
    {
      id: 'baz_2',
      monthId,
      memberId: 'mem_2',
      date: '2026-09-06',
      description: 'Fish & Chicken (মাছ ও মুরগি)',
      amount: 2400,
      type: 'fish_meat',
      createdAt: now,
      updatedAt: now,
      createdBy: 'tanvir',
      updatedBy: 'tanvir',
    },
    {
      id: 'baz_3',
      monthId,
      memberId: 'mem_3',
      date: '2026-09-10',
      description: 'Vegetables & Spices (সবজি ও মশলা)',
      amount: 1250,
      type: 'vegetables',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sabbir',
      updatedBy: 'sabbir',
    },
    {
      id: 'baz_4',
      monthId,
      memberId: 'mem_4',
      date: '2026-09-14',
      description: 'Beef & Potatoes (গরুর মাংস ও আলু)',
      amount: 2900,
      type: 'fish_meat',
      createdAt: now,
      updatedAt: now,
      createdBy: 'tanvir',
      updatedBy: 'tanvir',
    },
  ];

  // Initial Universal Expenses (Split across all 5 members)
  const initialUniversal: UniversalExpense[] = [
    {
      id: 'uni_1',
      monthId,
      date: '2026-09-05',
      description: 'Monthly WiFi Internet Bill (ইন্টারনেট বিল)',
      amount: 1000,
      applicableMemberIds: ['mem_1', 'mem_2', 'mem_3', 'mem_4', 'mem_5'],
      perMemberShare: 200,
      createdAt: now,
      updatedAt: now,
      createdBy: 'sabbir',
      updatedBy: 'sabbir',
    },
    {
      id: 'uni_2',
      monthId,
      date: '2026-09-08',
      description: 'Cook & Maid Advance (খালা বিল অগ্রিম)',
      amount: 2500,
      applicableMemberIds: ['mem_1', 'mem_2', 'mem_3', 'mem_4', 'mem_5'],
      perMemberShare: 500,
      createdAt: now,
      updatedAt: now,
      createdBy: 'tanvir',
      updatedBy: 'tanvir',
    },
  ];

  // Initial Additional Deposits
  const initialDeposits: Deposit[] = [
    {
      id: 'dep_1',
      monthId,
      memberId: 'mem_1',
      date: '2026-09-07',
      amount: 1000,
      note: 'Mid-month cash deposit',
      createdAt: now,
      updatedAt: now,
      createdBy: 'sabbir',
      updatedBy: 'sabbir',
    },
    {
      id: 'dep_2',
      monthId,
      memberId: 'mem_2',
      date: '2026-09-12',
      amount: 1000,
      note: 'bKash deposit',
      createdAt: now,
      updatedAt: now,
      createdBy: 'tanvir',
      updatedBy: 'tanvir',
    },
  ];

  const initialAudits: AuditEvent[] = [
    {
      id: 'aud_init_1',
      timestamp: now,
      action: 'CREATE_USER',
      entityType: 'UserAccount',
      entityId: user1.id,
      userId: 'system',
      username: 'system',
      details: 'Initial system user account created for sabbir',
    },
    {
      id: 'aud_init_2',
      timestamp: now,
      action: 'CREATE_USER',
      entityType: 'UserAccount',
      entityId: user2.id,
      userId: 'system',
      username: 'system',
      details: 'Initial system user account created for tanvir',
    },
    {
      id: 'aud_init_3',
      timestamp: now,
      action: 'CREATE_MONTH',
      entityType: 'Month',
      entityId: monthId,
      userId: user1.id,
      username: user1.username,
      details: 'Created month: September 2026 (সেপ্টেম্বর ২০২৬) in Auto Rate Mode',
    },
  ];

  const sabbirWorkspace: UserWorkspaceData = {
    months: [initialMonth],
    activeMonthId: monthId,
    members: initialMembers,
    dailyMeals: initialMeals,
    mealUpdateHistory: [],
    bazaarExpenses: initialBazaar,
    universalExpenses: initialUniversal,
    deposits: initialDeposits,
    auditEvents: initialAudits,
  };

  // Seed user-isolated workspaces
  safeSetItem(getUserWorkspaceKey(user1.id), sabbirWorkspace);
  safeSetItem(getUserWorkspaceKey(user2.id), createDefaultUserWorkspace(user2.id, user2.username));

  safeSetItem(STORAGE_KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
  safeSetItem(STORAGE_KEYS.USER_ACCOUNTS, initialUsers);
  safeSetItem(STORAGE_KEYS.MONTHS, [initialMonth]);
  safeSetItem(STORAGE_KEYS.ACTIVE_MONTH_ID, monthId);
  safeSetItem(STORAGE_KEYS.MEMBERS, initialMembers);
  safeSetItem(STORAGE_KEYS.DAILY_MEALS, initialMeals);
  safeSetItem(STORAGE_KEYS.MEAL_UPDATE_HISTORY, []);
  safeSetItem(STORAGE_KEYS.BAZAAR_EXPENSES, initialBazaar);
  safeSetItem(STORAGE_KEYS.UNIVERSAL_EXPENSES, initialUniversal);
  safeSetItem(STORAGE_KEYS.DEPOSITS, initialDeposits);
  safeSetItem(STORAGE_KEYS.AUDIT_EVENTS, initialAudits);

  return {
    userAccounts: initialUsers,
    session: null,
    months: [initialMonth],
    activeMonthId: monthId,
    members: initialMembers,
    dailyMeals: initialMeals,
    mealUpdateHistory: [],
    bazaarExpenses: initialBazaar,
    universalExpenses: initialUniversal,
    deposits: initialDeposits,
    auditEvents: initialAudits,
  };
}

export function getUserWorkspaceKey(userId: string): string {
  return `smm_workspace_${userId}`;
}

export function createDefaultUserWorkspace(userId: string, username: string): UserWorkspaceData {
  const now = new Date();
  const year = now.getFullYear();
  const monthNum = now.getMonth() + 1;
  const monthStr = monthNum.toString().padStart(2, '0');
  const monthNameEn = now.toLocaleString('en-US', { month: 'long' });
  const bnMonthNames = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const bnMonth = bnMonthNames[now.getMonth()] || 'মাস';
  const lastDay = new Date(year, monthNum, 0).getDate();

  const monthId = `month_${year}_${monthStr}_${generateId('m')}`;
  const nowIso = now.toISOString();

  const initialMonth: Month = {
    id: monthId,
    name: `${monthNameEn} ${year} (${bnMonth} ${year})`,
    startDate: `${year}-${monthStr}-01`,
    endDate: `${year}-${monthStr}-${lastDay.toString().padStart(2, '0')}`,
    totalDays: lastDay,
    status: 'active',
    calculationMode: 'auto',
    fixedMealRate: 65,
    avgMealAdjustmentEnabled: false,
    lockedAt: null,
    unlockedAt: null,
    lockedBy: null,
    lockReason: null,
    createdAt: nowIso,
    updatedAt: nowIso,
    createdBy: username,
    updatedBy: username,
  };

  const initialAudit: AuditEvent = {
    id: `aud_${Date.now()}`,
    timestamp: nowIso,
    action: 'CREATE_MONTH',
    entityType: 'Month',
    entityId: monthId,
    userId,
    username,
    details: `মেস ম্যানেজার অ্যাকাউন্ট খোলা হয়েছে (${initialMonth.name})`,
  };

  return {
    months: [initialMonth],
    activeMonthId: monthId,
    members: [],
    dailyMeals: [],
    mealUpdateHistory: [],
    bazaarExpenses: [],
    universalExpenses: [],
    deposits: [],
    auditEvents: [initialAudit],
  };
}

export function loadUserWorkspace(userId: string, username: string): UserWorkspaceData {
  const key = getUserWorkspaceKey(userId);
  const existing = safeGetItem<UserWorkspaceData | null>(key, null);

  if (existing && Array.isArray(existing.months)) {
    return existing;
  }

  // Check if this is the primary seeded user (usr_sabbir_01) and we have legacy global data to migrate
  if (userId === 'usr_sabbir_01') {
    const legacyMonths = safeGetItem<Month[]>(STORAGE_KEYS.MONTHS, []);
    if (legacyMonths.length > 0) {
      const legacyWorkspace: UserWorkspaceData = {
        months: legacyMonths,
        activeMonthId: safeGetItem<string | null>(STORAGE_KEYS.ACTIVE_MONTH_ID, legacyMonths[0]?.id || null),
        members: safeGetItem<Member[]>(STORAGE_KEYS.MEMBERS, []),
        dailyMeals: safeGetItem<DailyMeal[]>(STORAGE_KEYS.DAILY_MEALS, []),
        mealUpdateHistory: safeGetItem<MealUpdateHistoryItem[]>(STORAGE_KEYS.MEAL_UPDATE_HISTORY, []),
        bazaarExpenses: safeGetItem<BazaarExpense[]>(STORAGE_KEYS.BAZAAR_EXPENSES, []),
        universalExpenses: safeGetItem<UniversalExpense[]>(STORAGE_KEYS.UNIVERSAL_EXPENSES, []),
        deposits: safeGetItem<Deposit[]>(STORAGE_KEYS.DEPOSITS, []),
        auditEvents: safeGetItem<AuditEvent[]>(STORAGE_KEYS.AUDIT_EVENTS, []),
      };
      safeSetItem(key, legacyWorkspace);
      return legacyWorkspace;
    }
  }

  // Otherwise, create fresh isolated workspace for this user
  const defaultWorkspace = createDefaultUserWorkspace(userId, username);
  safeSetItem(key, defaultWorkspace);
  return defaultWorkspace;
}

export function saveUserWorkspace(userId: string, data: Partial<UserWorkspaceData>): void {
  const key = getUserWorkspaceKey(userId);
  const current = safeGetItem<UserWorkspaceData>(key, {
    months: [],
    activeMonthId: null,
    members: [],
    dailyMeals: [],
    mealUpdateHistory: [],
    bazaarExpenses: [],
    universalExpenses: [],
    deposits: [],
    auditEvents: [],
  });

  const updated: UserWorkspaceData = {
    months: data.months !== undefined ? data.months : current.months,
    activeMonthId: data.activeMonthId !== undefined ? data.activeMonthId : current.activeMonthId,
    members: data.members !== undefined ? data.members : current.members,
    dailyMeals: data.dailyMeals !== undefined ? data.dailyMeals : current.dailyMeals,
    mealUpdateHistory: data.mealUpdateHistory !== undefined ? data.mealUpdateHistory : current.mealUpdateHistory,
    bazaarExpenses: data.bazaarExpenses !== undefined ? data.bazaarExpenses : current.bazaarExpenses,
    universalExpenses: data.universalExpenses !== undefined ? data.universalExpenses : current.universalExpenses,
    deposits: data.deposits !== undefined ? data.deposits : current.deposits,
    auditEvents: data.auditEvents !== undefined ? data.auditEvents : current.auditEvents,
  };

  safeSetItem(key, updated);
}

export function loadAllData(currentUserId?: string, currentUsername?: string): AppStateData {
  let workspace: UserWorkspaceData;

  const session = safeGetItem<Session | null>(STORAGE_KEYS.SESSION, null);
  const activeUserId = currentUserId || session?.userId;
  const activeUsername = currentUsername || session?.username || 'user';

  if (activeUserId) {
    workspace = loadUserWorkspace(activeUserId, activeUsername);
  } else {
    workspace = {
      months: safeGetItem<Month[]>(STORAGE_KEYS.MONTHS, []),
      activeMonthId: safeGetItem<string | null>(STORAGE_KEYS.ACTIVE_MONTH_ID, null),
      members: safeGetItem<Member[]>(STORAGE_KEYS.MEMBERS, []),
      dailyMeals: safeGetItem<DailyMeal[]>(STORAGE_KEYS.DAILY_MEALS, []),
      mealUpdateHistory: safeGetItem<MealUpdateHistoryItem[]>(STORAGE_KEYS.MEAL_UPDATE_HISTORY, []),
      bazaarExpenses: safeGetItem<BazaarExpense[]>(STORAGE_KEYS.BAZAAR_EXPENSES, []),
      universalExpenses: safeGetItem<UniversalExpense[]>(STORAGE_KEYS.UNIVERSAL_EXPENSES, []),
      deposits: safeGetItem<Deposit[]>(STORAGE_KEYS.DEPOSITS, []),
      auditEvents: safeGetItem<AuditEvent[]>(STORAGE_KEYS.AUDIT_EVENTS, []),
    };
  }

  return {
    userAccounts: safeGetItem<UserAccount[]>(STORAGE_KEYS.USER_ACCOUNTS, []),
    session,
    ...workspace,
  };
}

export function saveAllData(state: Partial<AppStateData>, targetUserId?: string): void {
  if (state.userAccounts !== undefined) safeSetItem(STORAGE_KEYS.USER_ACCOUNTS, state.userAccounts);
  if (state.session !== undefined) safeSetItem(STORAGE_KEYS.SESSION, state.session);

  const activeUserId = targetUserId || state.session?.userId || safeGetItem<Session | null>(STORAGE_KEYS.SESSION, null)?.userId;
  if (activeUserId) {
    saveUserWorkspace(activeUserId, state);
  }

  // Also maintain global keys as fallback
  if (state.months !== undefined) safeSetItem(STORAGE_KEYS.MONTHS, state.months);
  if (state.activeMonthId !== undefined) safeSetItem(STORAGE_KEYS.ACTIVE_MONTH_ID, state.activeMonthId);
  if (state.members !== undefined) safeSetItem(STORAGE_KEYS.MEMBERS, state.members);
  if (state.dailyMeals !== undefined) safeSetItem(STORAGE_KEYS.DAILY_MEALS, state.dailyMeals);
  if (state.mealUpdateHistory !== undefined)
    safeSetItem(STORAGE_KEYS.MEAL_UPDATE_HISTORY, state.mealUpdateHistory);
  if (state.bazaarExpenses !== undefined)
    safeSetItem(STORAGE_KEYS.BAZAAR_EXPENSES, state.bazaarExpenses);
  if (state.universalExpenses !== undefined)
    safeSetItem(STORAGE_KEYS.UNIVERSAL_EXPENSES, state.universalExpenses);
  if (state.deposits !== undefined) safeSetItem(STORAGE_KEYS.DEPOSITS, state.deposits);
  if (state.auditEvents !== undefined) safeSetItem(STORAGE_KEYS.AUDIT_EVENTS, state.auditEvents);
}

/**
 * Creates exportable JSON backup payload. Passwords remain hashed, never plain text.
 */
export function createBackupPayload(username: string, userId?: string): AppBackupPayload {
  const data = loadAllData(userId, username);
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    appVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    exportedBy: username,
    userAccounts: data.userAccounts,
    months: data.months,
    members: data.members,
    dailyMeals: data.dailyMeals,
    mealUpdateHistory: data.mealUpdateHistory,
    bazaarExpenses: data.bazaarExpenses,
    universalExpenses: data.universalExpenses,
    deposits: data.deposits,
    auditEvents: data.auditEvents,
  };
}

/**
 * Validates and restores JSON backup.
 */
export function validateAndRestoreBackup(
  payload: unknown,
  restoringUsername: string,
  targetUserId?: string
): { success: boolean; error?: string; restoredData?: AppStateData } {
  if (!payload || typeof payload !== 'object') {
    return { success: false, error: 'Invalid backup file format.' };
  }

  const data = payload as Partial<AppBackupPayload>;

  if (!Array.isArray(data.months) || !Array.isArray(data.members)) {
    return { success: false, error: 'Backup is missing required months or members collections.' };
  }

  if (!Array.isArray(data.userAccounts) || data.userAccounts.length === 0) {
    return { success: false, error: 'Backup must contain at least one valid authorized user account.' };
  }

  const restoredAudit: AuditEvent = {
    id: `aud_restore_${Date.now()}`,
    timestamp: new Date().toISOString(),
    action: 'BACKUP_RESTORED',
    entityType: 'System',
    userId: targetUserId || 'restore_agent',
    username: restoringUsername,
    details: `Restored backup containing ${data.months.length} months, ${data.members.length} members.`,
  };

  const auditEvents = Array.isArray(data.auditEvents) ? [restoredAudit, ...data.auditEvents] : [restoredAudit];

  const restoredWorkspace: UserWorkspaceData = {
    months: data.months,
    activeMonthId: data.months[0]?.id || null,
    members: data.members,
    dailyMeals: data.dailyMeals || [],
    mealUpdateHistory: data.mealUpdateHistory || [],
    bazaarExpenses: data.bazaarExpenses || [],
    universalExpenses: data.universalExpenses || [],
    deposits: data.deposits || [],
    auditEvents,
  };

  if (targetUserId) {
    saveUserWorkspace(targetUserId, restoredWorkspace);
  }
  for (const acc of (data.userAccounts as UserAccount[])) {
    if (acc?.id) {
      saveUserWorkspace(acc.id, restoredWorkspace);
    }
  }

  const restoredState: AppStateData = {
    userAccounts: data.userAccounts as UserAccount[],
    session: null, // Forces secure re-login after restore
    ...restoredWorkspace,
  };

  saveAllData(restoredState, targetUserId || data.userAccounts[0]?.id);
  return { success: true, restoredData: restoredState };
}

export function exportAppDataAsJson(username: string = 'admin', userId?: string): string {
  const payload = createBackupPayload(username, userId);
  return JSON.stringify(payload, null, 2);
}

export function importAppDataFromJson(
  jsonString: string,
  restoringUsername: string = 'admin',
  targetUserId?: string
): { success: boolean; error?: string; restoredData?: AppStateData } {
  try {
    const parsed = JSON.parse(jsonString);
    return validateAndRestoreBackup(parsed, restoringUsername, targetUserId);
  } catch (e) {
    return { success: false, error: 'JSON ফাইলটি সঠিক নয় বা পার্স করতে সমস্যা হয়েছে।' };
  }
}

export function resetStorageToSeed(): void {
  try {
    localStorage.clear();
    initializeSeedDataIfEmpty();
  } catch (e) {
    console.error('Failed to reset seed storage:', e);
  }
}

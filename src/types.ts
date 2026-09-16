/**
 * Smart Meal Manager — Core Type Definitions
 * Strict adherence to PRD data models and business rules.
 */

export type CalculationMode = 'auto' | 'fixed';

export type MonthStatus = 'draft' | 'active' | 'locked' | 'archived';

export type BalanceStatus = 'receivable' | 'payable' | 'settled';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  createdBy: string;
  updatedBy: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  username: string;
  displayName: string;
  loginAt: string;
  lastActiveAt: string;
}

export interface Month {
  id: string;
  name: string; // e.g. "September 2026 / সেপ্টেম্বর ২০২৬"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  status: MonthStatus;
  calculationMode: CalculationMode;
  fixedMealRate: number;
  avgMealAdjustmentEnabled: boolean;
  lockedAt: string | null;
  unlockedAt: string | null;
  lockedBy: string | null;
  lockReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Member {
  id: string;
  monthId: string;
  name: string;
  phone?: string;
  previousBalance: number; // Carry forward from last month
  initialDeposit: number;
  isRemoved: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface DailyMeal {
  id: string;
  monthId: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  mealCount: number; // e.g., 0, 1, 2, 2.5, 3
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface MealUpdateHistoryItem {
  id: string;
  monthId: string;
  memberId: string;
  memberName: string;
  date: string; // YYYY-MM-DD
  previousMeal: number;
  newMeal: number;
  changedAt: string;
  changedBy: string;
  reason?: string;
}

export type BazaarExpenseType = 'groceries' | 'fish_meat' | 'vegetables' | 'spices_oil' | 'other';

export interface BazaarExpense {
  id: string;
  monthId: string;
  memberId: string; // Mandatory: Who shopped or funded
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: BazaarExpenseType;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface UniversalExpense {
  id: string;
  monthId: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  applicableMemberIds: string[]; // Members sharing this expense
  perMemberShare: number; // Calculated = amount / applicableMemberIds.length
  payerMemberId?: string | null; // Selected member who paid/funded this expense
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface Deposit {
  id: string;
  monthId: string;
  memberId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE_USER'
    | 'DEACTIVATE_USER'
    | 'CREATE_MONTH'
    | 'UPDATE_MONTH'
    | 'LOCK_MONTH'
    | 'UNLOCK_MONTH'
    | 'ADD_MEMBER'
    | 'UPDATE_MEMBER'
    | 'REMOVE_MEMBER'
    | 'SET_DAILY_MEAL'
    | 'UPDATE_DAILY_MEAL'
    | 'ADD_BAZAAR'
    | 'UPDATE_BAZAAR'
    | 'DELETE_BAZAAR'
    | 'ADD_UNIVERSAL'
    | 'UPDATE_UNIVERSAL'
    | 'DELETE_UNIVERSAL'
    | 'ADD_DEPOSIT'
    | 'UPDATE_DEPOSIT'
    | 'DELETE_DEPOSIT'
    | 'IMPORT_PREVIOUS_MONTH'
    | 'BACKUP_CREATED'
    | 'BACKUP_RESTORED';
  entityType: string;
  entityId?: string;
  userId: string;
  username: string;
  details: string;
}

export interface MemberFinancialSummary {
  memberId: string;
  name: string;
  previousBalance: number;
  totalMeal: number;
  mealCost: number;
  personalBazaarCost: number;
  universalCostShare: number;
  universalExpensePaid: number;
  totalDeposit: number;
  totalCost: number;
  finalBalance: number;
  balanceStatus: BalanceStatus;
}

export interface MonthFinancialSummary {
  monthId: string;
  totalMembers: number;
  totalMeals: number;
  totalGeneralBazaar: number;
  totalUniversalExpense: number;
  totalDeposits: number;
  mealRate: number;
  totalCost: number;
  totalReceivable: number;
  totalPayable: number;
  memberSummaries: Record<string, MemberFinancialSummary>;
}

export interface AppBackupPayload {
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  exportedBy: string;
  userAccounts: UserAccount[];
  months: Month[];
  members: Member[];
  dailyMeals: DailyMeal[];
  mealUpdateHistory: MealUpdateHistoryItem[];
  bazaarExpenses: BazaarExpense[];
  universalExpenses: UniversalExpense[];
  deposits: Deposit[];
  auditEvents: AuditEvent[];
}

export type ActiveNavTab = 'dashboard' | 'members' | 'bazaar' | 'meals' | 'reports' | 'settings';

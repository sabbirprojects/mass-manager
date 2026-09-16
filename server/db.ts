import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  UserAccount,
  UserWorkspaceData,
  Month,
  Member,
  DailyMeal,
  BazaarExpense,
  UniversalExpense,
  Deposit,
  AuditEvent,
} from '../src/types';
import { generateId, hashPassword } from '../src/utils/crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface ServerDatabase {
  schemaVersion: number;
  appVersion: string;
  userAccounts: UserAccount[];
  workspaces: Record<string, UserWorkspaceData>;
  globalWorkspace: UserWorkspaceData;
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
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

export async function generateInitialDatabase(): Promise<ServerDatabase> {
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

  const tanvirWorkspace = createDefaultUserWorkspace(user2.id, user2.username);

  return {
    schemaVersion: 1,
    appVersion: '1.0.0',
    userAccounts: initialUsers,
    workspaces: {
      [user1.id]: sabbirWorkspace,
      [user2.id]: tanvirWorkspace,
    },
    globalWorkspace: sabbirWorkspace,
  };
}

export async function readDatabase(): Promise<ServerDatabase> {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialDb = await generateInitialDatabase();
    await writeDatabase(initialDb);
    return initialDb;
  }

  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content) as ServerDatabase;
    if (!parsed.userAccounts || !Array.isArray(parsed.userAccounts) || parsed.userAccounts.length === 0) {
      const initialDb = await generateInitialDatabase();
      await writeDatabase(initialDb);
      return initialDb;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to read db.json, generating initial db:', err);
    const initialDb = await generateInitialDatabase();
    await writeDatabase(initialDb);
    return initialDb;
  }
}

export async function writeDatabase(data: ServerDatabase): Promise<void> {
  ensureDataDir();
  const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempFile, DB_FILE);
}

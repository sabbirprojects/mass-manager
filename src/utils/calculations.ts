/**
 * Smart Meal Manager — Pure Calculation Engine
 * Adheres strictly to Section 17 of the PRD:
 * - Pure and testable functions
 * - Decimal-safe operations
 * - Division by zero protection
 * - Independent calculation of Meal Rate, Personal Bazaar, Universal Share, and Final Balance
 */

import {
  BazaarExpense,
  DailyMeal,
  Deposit,
  Member,
  MemberFinancialSummary,
  Month,
  MonthFinancialSummary,
  UniversalExpense,
} from '../types';

/**
 * Safely rounds a number to 2 decimal places to avoid floating-point artifacts.
 */
export function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Format currency with Bangladeshi Taka symbol ৳
 */
export function formatTaka(amount: number): string {
  const rounded = roundToTwo(amount);
  const formatted = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (rounded < 0) {
    return `-৳${formatted}`;
  }
  return `৳${formatted}`;
}

/**
 * Format currency with ASCII 'Tk.' prefix safe for standard Latin PDF fonts
 */
export function formatTakaAscii(amount: number): string {
  const rounded = roundToTwo(amount);
  const formatted = Math.abs(rounded).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (rounded < 0) {
    return `-Tk. ${formatted}`;
  }
  return `Tk. ${formatted}`;
}

/**
 * Format meal count nicely (e.g. 2.5 or 3)
 */
export function formatMeal(count: number): string {
  return Number.isInteger(count) ? count.toString() : count.toFixed(1);
}

/**
 * Returns user-friendly Bengali label for bazaar expense categories
 */
export function getBazaarTypeLabel(type: string): string {
  switch (type) {
    case 'fish_meat':
      return 'মাছ-মাংস';
    case 'vegetables':
      return 'শাক-সবজি';
    case 'spices_oil':
      return 'মশলা-তেল';
    case 'groceries':
      return 'মুদি সামগ্রী';
    case 'bazaar_general':
      return 'সাধারণ বাজার';
    default:
      return 'অন্যান্য';
  }
}

/**
 * Generates clean, human-readable file names without trailing underscores,
 * special character cascades, or corrupted Bengali bytes.
 * e.g. "September 2026 (সেপ্টেম্বর ২০২৬)" -> "September_2026"
 */
export function formatSafeFileName(name: string, fallback = 'Report'): string {
  if (!name) return fallback;

  // Month map for Bengali month names
  const bnMonthMap: Record<string, string> = {
    'জানুয়ারি': 'January',
    'ফেব্রুয়ারি': 'February',
    'মার্চ': 'March',
    'এপ্রিল': 'April',
    'মে': 'May',
    'জুন': 'June',
    'জুলাই': 'July',
    'আগস্ট': 'August',
    'সেপ্টেম্বর': 'September',
    'অক্টোবর': 'October',
    'নভেম্বর': 'November',
    'ডিসেম্বর': 'December',
  };

  let str = name;
  for (const [bn, en] of Object.entries(bnMonthMap)) {
    str = str.replace(new RegExp(bn, 'g'), en);
  }

  // Convert Bengali numerals ০-৯ to 0-9
  str = str.replace(/[০-৯]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 0x09e6 + 48));

  // Remove parentheses contents with Bengali if English part exists
  const withoutBengaliParens = str.replace(/\s*\([^)]*[\u0980-\u09FF][^)]*\)/g, '').trim();
  let cleaned = withoutBengaliParens.replace(/[\u0980-\u09FF]+/g, '').trim();

  // Replace spaces, dashes, commas with single underscores
  cleaned = cleaned.replace(/[^a-zA-Z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

  return cleaned || fallback;
}

/**
 * Calculates member-wise and month-wise total meals based on active daily meals.
 */
export function calculateMemberMeals(
  members: Member[],
  dailyMeals: DailyMeal[]
): Record<string, number> {
  const mealMap: Record<string, number> = {};

  for (const m of members) {
    if (!m.isRemoved) {
      mealMap[m.id] = 0;
    }
  }

  for (const dm of dailyMeals) {
    if (mealMap[dm.memberId] !== undefined) {
      mealMap[dm.memberId] = roundToTwo(mealMap[dm.memberId] + (Number(dm.mealCount) || 0));
    }
  }

  return mealMap;
}

/**
 * Calculates total general bazaar expense assigned to each member and whole month.
 * Only positive bazaar amounts represent personal bazaar funded by member pocket.
 */
export function calculatePersonalBazaarCosts(
  members: Member[],
  bazaarExpenses: BazaarExpense[]
): Record<string, number> {
  const costMap: Record<string, number> = {};

  for (const m of members) {
    if (!m.isRemoved) {
      costMap[m.id] = 0;
    }
  }

  for (const b of bazaarExpenses) {
    const amt = Number(b.amount) || 0;
    if (amt > 0 && costMap[b.memberId] !== undefined) {
      costMap[b.memberId] = roundToTwo(costMap[b.memberId] + amt);
    }
  }

  return costMap;
}

/**
 * Calculates universal expense share for each member.
 * Each expense is evenly divided among its applicable members.
 */
export function calculateUniversalCostShares(
  members: Member[],
  universalExpenses: UniversalExpense[]
): Record<string, number> {
  const shareMap: Record<string, number> = {};

  for (const m of members) {
    if (!m.isRemoved) {
      shareMap[m.id] = 0;
    }
  }

  for (const ue of universalExpenses) {
    const applicableIds = ue.applicableMemberIds.filter((id) => shareMap[id] !== undefined);
    if (applicableIds.length > 0) {
      const perShare = roundToTwo((Number(ue.amount) || 0) / applicableIds.length);
      for (const id of applicableIds) {
        shareMap[id] = roundToTwo(shareMap[id] + perShare);
      }
    }
  }

  return shareMap;
}

/**
 * Calculates universal expenses paid by each member (to be credited directly to their account).
 */
export function calculateUniversalExpensesPaid(
  members: Member[],
  universalExpenses: UniversalExpense[]
): Record<string, number> {
  const paidMap: Record<string, number> = {};

  for (const m of members) {
    if (!m.isRemoved) {
      paidMap[m.id] = 0;
    }
  }

  for (const ue of universalExpenses) {
    if (ue.payerMemberId && paidMap[ue.payerMemberId] !== undefined) {
      paidMap[ue.payerMemberId] = roundToTwo(paidMap[ue.payerMemberId] + (Number(ue.amount) || 0));
    }
  }

  return paidMap;
}

/**
 * Calculates total deposits for each member (including initial deposit).
 * Automatically deducts negative market entries to reflect shopping done using shared funds.
 */
export function calculateMemberDeposits(
  members: Member[],
  deposits: Deposit[],
  bazaarExpenses: BazaarExpense[] = []
): Record<string, number> {
  const depositMap: Record<string, number> = {};

  for (const m of members) {
    if (!m.isRemoved) {
      depositMap[m.id] = roundToTwo(Number(m.initialDeposit) || 0);
    }
  }

  for (const d of deposits) {
    if (depositMap[d.memberId] !== undefined) {
      depositMap[d.memberId] = roundToTwo(depositMap[d.memberId] + (Number(d.amount) || 0));
    }
  }

  // Deduct negative market entries (shopping done using shared mess funds)
  for (const b of bazaarExpenses) {
    const amt = Number(b.amount) || 0;
    if (amt < 0 && depositMap[b.memberId] !== undefined) {
      depositMap[b.memberId] = roundToTwo(depositMap[b.memberId] + amt);
    }
  }

  return depositMap;
}

/**
 * Computes full monthly financial summary adhering strictly to PRD calculation rules:
 *
 * Total Meal = sum of all daily active meals
 * Auto Rate Mode: Meal Rate = Total General Bazaar Cost ÷ Total Meal (0 if Total Meal is 0)
 * Fixed Rate Mode: Meal Rate = fixedMealRate
 * Meal Cost = member's Total Meal × Meal Rate
 * Member Total Cost = Meal Cost + Universal Cost Share
 * Member Final Balance = Previous Balance + Deposit + Grocery Paid + Universal Paid - Total Cost
 *
 * Balance Status:
 * > 0 => 'receivable' (Mess owes member / Surplus)
 * < 0 => 'payable' (Member owes mess / Due)
 * = 0 => 'settled'
 */
export function computeMonthFinancialSummary(
  month: Month,
  members: Member[],
  dailyMeals: DailyMeal[],
  bazaarExpenses: BazaarExpense[],
  universalExpenses: UniversalExpense[],
  deposits: Deposit[]
): MonthFinancialSummary {
  const activeMembers = members.filter((m) => !m.isRemoved && m.monthId === month.id);
  const activeDailyMeals = dailyMeals.filter((dm) => dm.monthId === month.id);
  const activeBazaar = bazaarExpenses.filter((b) => b.monthId === month.id);
  const activeUniversal = universalExpenses.filter((u) => u.monthId === month.id);
  const activeDeposits = deposits.filter((d) => d.monthId === month.id);

  // 1. Calculate Meals
  const mealMap = calculateMemberMeals(activeMembers, activeDailyMeals);
  let totalMeals = 0;
  for (const count of Object.values(mealMap)) {
    totalMeals = roundToTwo(totalMeals + count);
  }

  // 2. Calculate General Bazaar
  const personalBazaarMap = calculatePersonalBazaarCosts(activeMembers, activeBazaar);
  let totalGeneralBazaar = 0;
  for (const b of activeBazaar) {
    // Both personal out-of-pocket and shared-fund bazaar contribute to mess grocery consumption
    totalGeneralBazaar = roundToTwo(totalGeneralBazaar + Math.abs(Number(b.amount) || 0));
  }

  // 3. Calculate Universal Expenses (shares divided among members + direct credit to payer)
  const universalShareMap = calculateUniversalCostShares(activeMembers, activeUniversal);
  const universalPaidMap = calculateUniversalExpensesPaid(activeMembers, activeUniversal);
  let totalUniversalExpense = 0;
  for (const u of activeUniversal) {
    totalUniversalExpense = roundToTwo(totalUniversalExpense + (Number(u.amount) || 0));
  }

  // 4. Calculate Deposits (with negative market entries automatically deducted)
  const depositMap = calculateMemberDeposits(activeMembers, activeDeposits, activeBazaar);
  let totalDeposits = 0;
  for (const dep of Object.values(depositMap)) {
    totalDeposits = roundToTwo(totalDeposits + dep);
  }

  // 5. Determine Meal Rate
  let mealRate = 0;
  if (month.calculationMode === 'auto') {
    mealRate = totalMeals > 0 ? roundToTwo(totalGeneralBazaar / totalMeals) : 0;
  } else {
    mealRate = roundToTwo(Number(month.fixedMealRate) || 0);
  }

  // 6. Build Member Summaries
  const memberSummaries: Record<string, MemberFinancialSummary> = {};
  let totalCost = 0;
  let totalReceivable = 0;
  let totalPayable = 0;

  for (const m of activeMembers) {
    const memTotalMeal = mealMap[m.id] || 0;
    const memMealCost = roundToTwo(memTotalMeal * mealRate);
    const memPersonalBazaar = personalBazaarMap[m.id] || 0;
    const memUniversalShare = universalShareMap[m.id] || 0;
    const memUniversalPaid = universalPaidMap[m.id] || 0;
    const memTotalCost = roundToTwo(memMealCost + memUniversalShare);
    const memDeposit = depositMap[m.id] || 0;
    const memPrevBal = roundToTwo(Number(m.previousBalance) || 0);

    // Final Balance = Previous Balance + Deposit + Grocery Expenses + Universal Expenses Paid - Total Cost
    // When a member is selected for universal expense, the total amount is divided equally among members
    // (deducted via universalCostShare), and credited directly to that selected member's account (+memUniversalPaid).
    const memFinalBalance = roundToTwo(
      memPrevBal + memDeposit + memPersonalBazaar + memUniversalPaid - memTotalCost
    );

    let status: 'receivable' | 'payable' | 'settled' = 'settled';
    if (memFinalBalance > 0.009) {
      status = 'receivable';
      totalReceivable = roundToTwo(totalReceivable + memFinalBalance);
    } else if (memFinalBalance < -0.009) {
      status = 'payable';
      totalPayable = roundToTwo(totalPayable + Math.abs(memFinalBalance));
    } else {
      status = 'settled';
    }

    totalCost = roundToTwo(totalCost + memTotalCost);

    memberSummaries[m.id] = {
      memberId: m.id,
      name: m.name,
      previousBalance: memPrevBal,
      totalMeal: memTotalMeal,
      mealCost: memMealCost,
      personalBazaarCost: memPersonalBazaar,
      universalCostShare: memUniversalShare,
      universalExpensePaid: memUniversalPaid,
      totalDeposit: memDeposit,
      totalCost: memTotalCost,
      finalBalance: memFinalBalance,
      balanceStatus: status,
    };
  }

  return {
    monthId: month.id,
    totalMembers: activeMembers.length,
    totalMeals,
    totalGeneralBazaar,
    totalUniversalExpense,
    totalDeposits,
    mealRate,
    totalCost,
    totalReceivable,
    totalPayable,
    memberSummaries,
  };
}

/**
 * Timezone-safe Date Utility Functions for Smart Meal Manager
 * Ensures all dates (YYYY-MM-DD) reflect local user timezone (e.g. Bangladesh GMT+6)
 * and eliminates off-by-one day bugs caused by toISOString() UTC shifts.
 */

/**
 * Returns a 'YYYY-MM-DD' formatted string in the client's local timezone.
 * Unlike date.toISOString().slice(0, 10), this NEVER shifts backwards across midnight in GMT+6.
 */
export function getLocalDateString(d: Date | number = new Date()): string {
  const date = typeof d === 'number' ? new Date(d) : d;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Safely parses a 'YYYY-MM-DD' date string into a local midnight Date object,
 * avoiding the UTC parsing behavior of `new Date("YYYY-MM-DD")`.
 */
export function parseLocalDate(dateStr: string): Date {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = (parts[1] || 1) - 1;
  const day = parts[2] || 1;
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Calculates the start (1st day) and end (last day) 'YYYY-MM-DD' strings for a given month and year.
 */
export function getMonthStartAndEnd(year: number, monthIndex: number): { startDate: string; endDate: string } {
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 0);
  return {
    startDate: getLocalDateString(start),
    endDate: getLocalDateString(end),
  };
}

/**
 * Generates an array of all day items between startDateStr and endDateStr inclusive.
 */
export function getDaysInRange(
  startDateStr: string,
  endDateStr: string
): { dateStr: string; dayNum: number; dayName: string }[] {
  const days: { dateStr: string; dayNum: number; dayName: string }[] = [];
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const curr = new Date(start.getTime());

  while (curr <= end) {
    const dateStr = getLocalDateString(curr);
    days.push({
      dateStr,
      dayNum: curr.getDate(),
      dayName: curr.toLocaleDateString('en-US', { weekday: 'short' }),
    });
    curr.setDate(curr.getDate() + 1);
  }

  return days;
}

/**
 * Format date string into readable Bengali representation (e.g., '০১ অক্টোবর, ২০২৬')
 */
export function formatBengaliDate(dateStr: string): string {
  try {
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

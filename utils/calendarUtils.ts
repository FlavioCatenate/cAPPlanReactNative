import type { Allocation } from '../store/slices/allocationSlice';
import Colors from '../constants/colors';

// ─── Types ─────────────────────────────────────────────────────────────────

export type CalendarStatus = 'active' | 'expiring' | 'completed' | 'free';

export interface WeekRange {
  start: Date;
  end: Date;
  /** Label shown in the header, e.g. "1–7" */
  label: string;
  isCurrentWeek: boolean;
}

// ─── Priority (expiring wins over active, active over completed, etc.) ──────

const PRIORITY: Record<CalendarStatus, number> = {
  expiring:  3,
  active:    2,
  completed: 1,
  free:      0,
};

// ─── Date helpers ────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string to midnight local time (avoids UTC offset issues). */
function parseDate(s: string): Date {
  return new Date(s + 'T00:00:00');
}

/** True if the allocation period overlaps with [rangeFrom, rangeTo] (inclusive). */
function overlaps(fromStr: string, toStr: string, rangeFrom: Date, rangeTo: Date): boolean {
  return parseDate(fromStr) <= rangeTo && parseDate(toStr) >= rangeFrom;
}

/** Calendar days remaining until the allocation's end date (can be negative). */
function daysUntilEnd(toStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((parseDate(toStr).getTime() - today.getTime()) / 86_400_000);
}

// ─── Core logic ──────────────────────────────────────────────────────────────

/**
 * Given all allocations, an employee ID, and a date range, returns the
 * "worst" status among overlapping allocations (expiring > active > completed > free).
 *
 * Designed to work for both week ranges (CalendarScreen) and single days
 * (EmployeeMonthScreen) — just pass the same date for rangeFrom and rangeTo.
 */
export function getStatusForPeriod(
  allocations: Allocation[],
  employeeId: number,
  rangeFrom: Date,
  rangeTo: Date,
): CalendarStatus {
  const relevant = allocations.filter(
    (a) =>
      Number(a.employee?.id) === employeeId &&
      overlaps(a.fromDate, a.toDate, rangeFrom, rangeTo),
  );

  if (!relevant.length) return 'free';

  let best: CalendarStatus = 'free';

  for (const a of relevant) {
    const s: CalendarStatus =
      a.project?.isActive === false
        ? 'completed'
        : daysUntilEnd(a.toDate) <= 30
        ? 'expiring'
        : 'active';

    if (PRIORITY[s] > PRIORITY[best]) best = s;
  }

  return best;
}

/** Returns the background color for a CalendarStatus, or undefined for 'free'. */
export function getCalendarStatusColor(status: CalendarStatus): string | undefined {
  switch (status) {
    case 'active':    return Colors.successColor;
    case 'expiring':  return Colors.warningColor;
    case 'completed': return Colors.errorColor;
    default:          return undefined;
  }
}

// ─── Month / week / day generators ──────────────────────────────────────────

/**
 * Splits a month into week chunks (Mon → Sun), clamped to the month boundaries.
 * Typically yields 5 chunks for a 30/31-day month.
 */
export function getWeeksOfMonth(year: number, month: number): WeekRange[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  const weeks: WeekRange[] = [];

  let cur = new Date(firstDay);

  while (cur <= lastDay) {
    const start = new Date(cur);
    const end   = new Date(cur);
    end.setDate(end.getDate() + 6);
    const clampedEnd = end > lastDay ? new Date(lastDay) : end;

    weeks.push({
      start,
      end: clampedEnd,
      label: `${start.getDate()}–${clampedEnd.getDate()}`,
      isCurrentWeek: today >= start && today <= clampedEnd,
    });

    cur.setDate(cur.getDate() + 7);
  }

  return weeks;
}

/** Returns every Date in the given month. */
export function getDaysInMonth(year: number, month: number): Date[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(year, month, i + 1));
}

/**
 * Returns the 0-based column index (Mon = 0 … Sun = 6) of the first day
 * of the given month. Used to pad the calendar grid.
 */
export function getFirstDayOfWeekIndex(year: number, month: number): number {
  const jsDay = new Date(year, month, 1).getDay(); // 0 = Sun
  return jsDay === 0 ? 6 : jsDay - 1;
}

/** Italian month names. */
export function getMonthName(month: number): string {
  return [
    'Gennaio', 'Febbraio', 'Marzo',     'Aprile',
    'Maggio',  'Giugno',   'Luglio',    'Agosto',
    'Settembre','Ottobre', 'Novembre',  'Dicembre',
  ][month];
}
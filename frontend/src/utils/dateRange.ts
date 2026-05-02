import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, parseISO, subMonths } from 'date-fns';
import { DateRange, DateRangeKey, Transaction } from '../types';

export function getDateRange(key: DateRangeKey, ref?: Date): DateRange {
  const now = ref || new Date();
  switch (key) {
    case 'today':
      return { key, label: 'Today', start: format(now, 'yyyy-MM-dd'), end: format(now, 'yyyy-MM-dd') };
    case 'week':
      return {
        key, label: 'This Week',
        start: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return { key, label: 'This Month', start: format(startOfMonth(now), 'yyyy-MM-dd'), end: format(endOfMonth(now), 'yyyy-MM-dd') };
    case 'quarter':
      return { key, label: 'This Quarter', start: format(startOfQuarter(now), 'yyyy-MM-dd'), end: format(endOfQuarter(now), 'yyyy-MM-dd') };
    case 'year':
      return { key, label: 'This Year', start: format(startOfYear(now), 'yyyy-MM-dd'), end: format(endOfYear(now), 'yyyy-MM-dd') };
    case 'all':
      return { key, label: 'All Time' };
    default:
      return { key, label: 'Custom' };
  }
}

export function isInRange(t: Transaction, range: DateRange): boolean {
  if (range.key === 'all' || !range.start || !range.end) return true;
  try {
    const td = parseISO(t.date);
    const start = parseISO(range.start);
    const end = parseISO(range.end);
    return isWithinInterval(td, { start, end });
  } catch {
    return false;
  }
}

export const RANGE_OPTIONS: DateRangeKey[] = ['today', 'week', 'month', 'quarter', 'year', 'all'];

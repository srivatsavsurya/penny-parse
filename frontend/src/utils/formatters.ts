import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const formatCurrency = (amount: number, showSign = false): string => {
  const sign = amount < 0 ? '-' : showSign ? '+' : '';
  return `${sign}\u20B9${new Intl.NumberFormat('en-IN').format(Math.abs(amount))}`;
};

export const formatAmount = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${(abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 2)}Cr`;
  if (abs >= 100000) return `${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 2)}L`;
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(abs);
};

export const formatCompact = (amount: number): string => {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K`;
  return new Intl.NumberFormat('en-IN').format(abs);
};

export const formatDate = (dateString: string): string => {
  try {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  } catch {
    return dateString;
  }
};

export const formatFullDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'EEE, MMM d, yyyy');
  } catch {
    return dateString;
  }
};

export const formatMonthYear = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'MMMM yyyy');
  } catch {
    return dateString;
  }
};

export const getCurrentMonth = (): string => format(new Date(), 'MMMM yyyy');

export const isCurrentMonth = (dateString: string, ref?: Date): boolean => {
  try {
    const date = parseISO(dateString);
    const now = ref || new Date();
    return isWithinInterval(date, { start: startOfMonth(now), end: endOfMonth(now) });
  } catch {
    return false;
  }
};

export const todayISO = (): string => format(new Date(), 'yyyy-MM-dd');

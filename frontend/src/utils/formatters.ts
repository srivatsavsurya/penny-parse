import { format, isToday, isYesterday, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return `₹${new Intl.NumberFormat('en-IN').format(amount)}`;
};

export const formatAmount = (amount: number): string => {
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d');
};

export const formatFullDate = (dateString: string): string => {
  return format(parseISO(dateString), 'MMM d, yyyy');
};

export const formatTime = (time: string): string => {
  return time;
};

export const getCurrentMonth = (): string => {
  return format(new Date(), 'MMMM yyyy');
};

export const isCurrentMonth = (dateString: string): boolean => {
  const date = parseISO(dateString);
  const now = new Date();
  return isWithinInterval(date, {
    start: startOfMonth(now),
    end: endOfMonth(now),
  });
};

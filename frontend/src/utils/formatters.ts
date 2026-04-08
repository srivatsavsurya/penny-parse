import { format, isToday, isYesterday, parseISO } from 'date-fns';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = parseISO(dateString);
  
  if (isToday(date)) {
    return 'TODAY';
  }
  if (isYesterday(date)) {
    return 'YESTERDAY';
  }
  
  return format(date, 'MMM dd').toUpperCase();
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatDateFull = (dateString: string): string => {
  const date = parseISO(dateString);
  return format(date, 'MMM dd, yyyy');
};

export const getMonthYear = (): string => {
  return format(new Date(), 'MMMM yyyy');
};

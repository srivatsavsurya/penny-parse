import { Transaction } from '../types';
import { format, subDays } from 'date-fns';

const id = () => Math.random().toString(36).substr(2, 9);
const today = format(new Date(), 'yyyy-MM-dd');
const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: id(), amount: 458, merchant: 'Zomato', category: 'food', date: today, time: '12:30 PM', isCredit: false, source: 'sms', upiRef: '412345678901' },
  { id: id(), amount: 320, merchant: 'Uber', category: 'travel', date: today, time: '09:15 AM', isCredit: false, source: 'sms' },
  { id: id(), amount: 740, merchant: 'Starbucks', category: 'food', date: today, time: '11:00 AM', isCredit: false, source: 'manual' },
  { id: id(), amount: 2140, merchant: 'BESCOM', category: 'bills', date: yesterday, time: '06:30 PM', isCredit: false, source: 'sms' },
  { id: id(), amount: 85000, merchant: 'Salary', category: 'transfer', date: yesterday, time: '10:00 AM', isCredit: true, source: 'sms', notes: 'Monthly salary' },
  { id: id(), amount: 1250, merchant: 'Amazon', category: 'shopping', date: yesterday, time: '03:45 PM', isCredit: false, source: 'sms' },
  { id: id(), amount: 899, merchant: 'Airtel', category: 'bills', date: format(subDays(new Date(), 2), 'yyyy-MM-dd'), time: '11:00 AM', isCredit: false, source: 'sms' },
  { id: id(), amount: 2800, merchant: 'BigBasket', category: 'groceries', date: format(subDays(new Date(), 3), 'yyyy-MM-dd'), time: '07:00 PM', isCredit: false, source: 'sms' },
  { id: id(), amount: 499, merchant: 'Netflix', category: 'entertainment', date: format(subDays(new Date(), 5), 'yyyy-MM-dd'), time: '12:01 AM', isCredit: false, source: 'sms', notes: 'Monthly subscription' },
  { id: id(), amount: 4200, merchant: 'PVR Cinemas', category: 'entertainment', date: format(subDays(new Date(), 7), 'yyyy-MM-dd'), time: '07:30 PM', isCredit: false, source: 'manual' },
];

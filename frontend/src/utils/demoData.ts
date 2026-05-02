import { Transaction } from '../types';
import { format, subDays } from 'date-fns';

const rid = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
const day = (n: number) => format(subDays(new Date(), n), 'yyyy-MM-dd');
const now = Date.now();

export const DEMO_TRANSACTIONS: Transaction[] = [
  { id: rid(), amount: 458, merchant: 'Zomato', category: 'food', accountId: 'acc_hdfc', date: day(0), time: '12:30 PM', isCredit: false, source: 'sms', upiRef: '412345678901', createdAt: now },
  { id: rid(), amount: 320, merchant: 'Uber', category: 'travel', accountId: 'acc_hdfc', date: day(0), time: '09:15 AM', isCredit: false, source: 'sms', createdAt: now - 1000 },
  { id: rid(), amount: 740, merchant: 'Starbucks', category: 'food', accountId: 'acc_hdfc', date: day(0), time: '11:00 AM', isCredit: false, source: 'manual', createdAt: now - 2000 },
  { id: rid(), amount: 2140, merchant: 'BESCOM', category: 'bills', accountId: 'acc_hdfc', date: day(1), time: '06:30 PM', isCredit: false, source: 'sms', createdAt: now - 3000 },
  { id: rid(), amount: 85000, merchant: 'Salary Acme Corp', category: 'income', accountId: 'acc_hdfc', date: day(1), time: '10:00 AM', isCredit: true, source: 'sms', notes: 'Monthly salary', createdAt: now - 4000 },
  { id: rid(), amount: 1250, merchant: 'Amazon', category: 'shopping', accountId: 'acc_hdfc', date: day(2), time: '03:45 PM', isCredit: false, source: 'sms', createdAt: now - 5000 },
  { id: rid(), amount: 899, merchant: 'Airtel', category: 'bills', accountId: 'acc_hdfc', date: day(2), time: '11:00 AM', isCredit: false, source: 'sms', createdAt: now - 6000 },
  { id: rid(), amount: 2800, merchant: 'BigBasket', category: 'groceries', accountId: 'acc_hdfc', date: day(3), time: '07:00 PM', isCredit: false, source: 'sms', createdAt: now - 7000 },
  { id: rid(), amount: 499, merchant: 'Netflix', category: 'entertainment', accountId: 'acc_hdfc', date: day(5), time: '12:01 AM', isCredit: false, source: 'sms', notes: 'Monthly subscription', createdAt: now - 8000 },
  { id: rid(), amount: 4200, merchant: 'PVR Cinemas', category: 'entertainment', accountId: 'acc_hdfc', date: day(7), time: '07:30 PM', isCredit: false, source: 'manual', createdAt: now - 9000 },
  { id: rid(), amount: 1800, merchant: 'Apollo Pharmacy', category: 'health', accountId: 'acc_hdfc', date: day(9), time: '02:00 PM', isCredit: false, source: 'sms', createdAt: now - 10000 },
  { id: rid(), amount: 650, merchant: 'Swiggy', category: 'food', accountId: 'acc_hdfc', date: day(4), time: '08:45 PM', isCredit: false, source: 'sms', createdAt: now - 11000 },
  { id: rid(), amount: 340, merchant: 'Ola', category: 'travel', accountId: 'acc_hdfc', date: day(6), time: '10:30 PM', isCredit: false, source: 'sms', createdAt: now - 12000 },
  { id: rid(), amount: 3500, merchant: 'Zepto', category: 'groceries', accountId: 'acc_hdfc', date: day(8), time: '06:00 PM', isCredit: false, source: 'sms', createdAt: now - 13000 },
  { id: rid(), amount: 12000, merchant: 'Freelance Client', category: 'income', accountId: 'acc_hdfc', date: day(10), time: '11:00 AM', isCredit: true, source: 'sms', notes: 'Project payment', createdAt: now - 14000 },
];

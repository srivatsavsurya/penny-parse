import { CategoryInfo, CategoryType } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food & Drink', icon: 'restaurant', color: '#F97316', bgColor: '#FFEDD5' },
  { id: 'groceries', name: 'Groceries', icon: 'cart', color: '#10B981', bgColor: '#D1FAE5' },
  { id: 'travel', name: 'Transport', icon: 'car-sport', color: '#3B82F6', bgColor: '#DBEAFE' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#8B5CF6', bgColor: '#EDE9FE' },
  { id: 'bills', name: 'Bills & Utilities', icon: 'receipt', color: '#EF4444', bgColor: '#FEE2E2' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#EC4899', bgColor: '#FCE7F3' },
  { id: 'health', name: 'Health', icon: 'medkit', color: '#14B8A6', bgColor: '#CCFBF1' },
  { id: 'education', name: 'Education', icon: 'school', color: '#6366F1', bgColor: '#E0E7FF' },
  { id: 'transfer', name: 'Transfer', icon: 'swap-horizontal', color: '#64748B', bgColor: '#F1F5F9' },
  { id: 'income', name: 'Income', icon: 'trending-up', color: '#059669', bgColor: '#D1FAE5' },
  { id: 'others', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', bgColor: '#F3F4F6' },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter(
  (c) => c.id !== 'income' && c.id !== 'transfer'
);

export const getCategoryInfo = (id: CategoryType): CategoryInfo => {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

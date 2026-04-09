import { CategoryInfo, CategoryType } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#059669' },
  { id: 'travel', name: 'Travel', icon: 'car', color: '#2563EB' },
  { id: 'shopping', name: 'Shopping', icon: 'bag', color: '#7C3AED' },
  { id: 'bills', name: 'Bills', icon: 'flash', color: '#DC2626' },
  { id: 'entertainment', name: 'Fun', icon: 'game-controller', color: '#EA580C' },
  { id: 'groceries', name: 'Grocery', icon: 'cart', color: '#0D9488' },
  { id: 'transfer', name: 'Transfer', icon: 'swap-horizontal', color: '#6366F1' },
  { id: 'others', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export const getCategoryInfo = (categoryId: CategoryType): CategoryInfo => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

export const getCategoryColor = (categoryId: CategoryType): string => {
  return getCategoryInfo(categoryId).color;
};

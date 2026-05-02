import { CategoryInfo, CategoryType } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food', icon: 'restaurant-outline', color: '#F59E0B' },
  { id: 'travel', name: 'Travel', icon: 'car-outline', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-outline', color: '#8B5CF6' },
  { id: 'bills', name: 'Bills', icon: 'flash-outline', color: '#EF4444' },
  { id: 'entertainment', name: 'Fun', icon: 'game-controller-outline', color: '#EC4899' },
  { id: 'groceries', name: 'Grocery', icon: 'cart-outline', color: '#10B981' },
  { id: 'transfer', name: 'Transfer', icon: 'swap-horizontal-outline', color: '#6366F1' },
  { id: 'others', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280' },
];

export const getCategoryInfo = (id: CategoryType): CategoryInfo => {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

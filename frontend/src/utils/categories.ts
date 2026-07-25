import { CategoryInfo, CategoryType, NeedWantTag } from '../types';

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  { id: 'food', name: 'Food', icon: 'restaurant', color: '#F97316', bgColor: '#FFEDD5', type: 'expense' },
  { id: 'groceries', name: 'Groceries', icon: 'cart', color: '#10B981', bgColor: '#D1FAE5', type: 'expense' },
  { id: 'travel', name: 'Transport', icon: 'car-sport', color: '#3B82F6', bgColor: '#DBEAFE', type: 'expense' },
  { id: 'shopping', name: 'Shopping', icon: 'bag-handle', color: '#8B5CF6', bgColor: '#EDE9FE', type: 'expense' },
  { id: 'bills', name: 'Utilities', icon: 'receipt', color: '#EF4444', bgColor: '#FEE2E2', type: 'expense' },
  { id: 'entertainment', name: 'Entertainment', icon: 'film', color: '#EC4899', bgColor: '#FCE7F3', type: 'expense' },
  { id: 'health', name: 'Medical', icon: 'medkit', color: '#14B8A6', bgColor: '#CCFBF1', type: 'expense' },
  { id: 'trip', name: 'Travel', icon: 'airplane', color: '#0EA5E9', bgColor: '#E0F2FE', type: 'expense' },
  { id: 'investment', name: 'Investment', icon: 'trending-up-outline', color: '#F59E0B', bgColor: '#FEF3C7', type: 'expense' },
  { id: 'education', name: 'Education', icon: 'school', color: '#6366F1', bgColor: '#E0E7FF', type: 'expense' },
  { id: 'transfer', name: 'Transfer', icon: 'swap-horizontal', color: '#64748B', bgColor: '#F1F5F9', type: 'transfer' },
  { id: 'income', name: 'Income', icon: 'trending-up', color: '#059669', bgColor: '#D1FAE5', type: 'income' },
  { id: 'others', name: 'Other', icon: 'ellipsis-horizontal', color: '#6B7280', bgColor: '#F3F4F6', type: 'expense' },
];

export const ICON_OPTIONS = [
  'restaurant', 'cart', 'car-sport', 'bag-handle', 'receipt', 'film', 'medkit', 'school',
  'swap-horizontal', 'trending-up', 'ellipsis-horizontal', 'cafe', 'beer', 'pizza', 'fast-food',
  'gift', 'heart', 'home', 'paw', 'fitness', 'barbell', 'bicycle', 'airplane', 'train',
  'bus', 'boat', 'rocket', 'business', 'briefcase', 'cash', 'wallet', 'card',
  'shirt', 'glasses', 'phone-portrait', 'laptop', 'game-controller', 'musical-notes',
  'book', 'library', 'leaf', 'flower', 'flame', 'gift-outline', 'paper-plane',
  'people', 'person', 'cut', 'construct', 'hammer', 'water', 'flash',
];

export const COLOR_PALETTE = [
  '#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444',
  '#EC4899', '#14B8A6', '#6366F1', '#64748B', '#059669',
  '#F59E0B', '#84CC16', '#06B6D4', '#A855F7', '#D946EF',
];

export const getCategoryInfo = (id: CategoryType, customs: CategoryInfo[] = []): CategoryInfo => {
  const all = [...DEFAULT_CATEGORIES, ...customs];
  return all.find((c) => c.id === id) || all[all.length - 1];
};

export const getAllCategories = (customs: CategoryInfo[] = []): CategoryInfo[] => {
  return [...DEFAULT_CATEGORIES, ...customs];
};

export const getExpenseCategories = (customs: CategoryInfo[] = []): CategoryInfo[] => {
  return getAllCategories(customs).filter((c) => c.type !== 'income' && c.type !== 'transfer');
};

export const CATEGORIES = DEFAULT_CATEGORIES;
export const EXPENSE_CATEGORIES = DEFAULT_CATEGORIES.filter((c) => c.type !== 'income' && c.type !== 'transfer');

export interface TagInfo {
  id: NeedWantTag;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const TAGS: TagInfo[] = [
  { id: 'need', name: 'Need', icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5', description: 'Essential' },
  { id: 'want', name: 'Want', icon: 'heart', color: '#EC4899', bgColor: '#FCE7F3', description: 'Discretionary' },
  { id: 'investment', name: 'Investment', icon: 'trending-up', color: '#F59E0B', bgColor: '#FEF3C7', description: 'Grows over time' },
  { id: 'business', name: 'Business', icon: 'briefcase', color: '#6366F1', bgColor: '#E0E7FF', description: 'Work expense' },
];

export const getTagInfo = (id?: NeedWantTag): TagInfo | null => {
  if (!id || id === 'unset') return null;
  return TAGS.find((t) => t.id === id) || null;
};

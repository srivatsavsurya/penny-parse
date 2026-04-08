import { CategoryInfo, CategoryType } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    icon: 'restaurant',
    color: '#0D5D56',
    bgColor: '#E8F5F3',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: 'car',
    color: '#1E40AF',
    bgColor: '#DBEAFE',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'bag',
    color: '#7C3AED',
    bgColor: '#EDE9FE',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'flash',
    color: '#DC2626',
    bgColor: '#FEE2E2',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'film',
    color: '#EA580C',
    bgColor: '#FFEDD5',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: 'cart',
    color: '#059669',
    bgColor: '#D1FAE5',
  },
  {
    id: 'others',
    name: 'Others',
    icon: 'ellipsis-horizontal',
    color: '#6B7280',
    bgColor: '#F3F4F6',
  },
];

export const getCategoryInfo = (categoryId: CategoryType): CategoryInfo => {
  return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
};

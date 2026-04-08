export type CategoryType = 
  | 'food'
  | 'travel'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'groceries'
  | 'others';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: CategoryType;
  date: string; // ISO string
  time: string;
  location?: string;
  isCredit: boolean;
  tags?: string[];
  notes?: string;
  verified?: 'ENCRYPTED' | 'UPI_VERIFIED';
}

export interface SmartRule {
  id: string;
  keywords: string[];
  category: CategoryType;
  enabled: boolean;
}

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

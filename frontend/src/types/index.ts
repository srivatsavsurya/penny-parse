export type CategoryType =
  | 'food'
  | 'travel'
  | 'shopping'
  | 'bills'
  | 'entertainment'
  | 'groceries'
  | 'transfer'
  | 'others';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: CategoryType;
  date: string;
  time: string;
  isCredit: boolean;
  notes?: string;
  source: 'sms' | 'manual';
}

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
}

export interface AppSettings {
  enableAiInsights: boolean;
  autoCategorizeSms: boolean;
  currency: string;
  openRouterApiKey?: string;
}

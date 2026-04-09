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
  location?: string;
  isCredit: boolean;
  notes?: string;
  upiRef?: string;
  bankAccount?: string;
  source: 'sms' | 'manual';
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
}

export interface AppSettings {
  openRouterApiKey?: string;
  enableAiInsights: boolean;
  autoCategorizeSms: boolean;
  currency: string;
}

export interface ParsedSMS {
  amount: number;
  merchant: string;
  isDebit: boolean;
  upiRef?: string;
  bankAccount?: string;
  rawMessage: string;
}

export type CategoryType = string;

export type NeedWantTag = 'need' | 'want' | 'investment' | 'business' | 'unset';

export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  category: CategoryType;
  tag?: NeedWantTag;
  parseConfidence?: number;
  accountId?: string;
  date: string;
  time: string;
  isCredit: boolean;
  notes?: string;
  tags?: string[];
  source: 'sms' | 'manual' | 'notification' | 'llm';
  upiRef?: string;
  bankAccount?: string;
  createdAt: number;
}

export type AccountType = 'bank' | 'card' | 'cash' | 'wallet';

export interface Account {
  id: string;
  name: string;
  bank?: string;
  type: AccountType;
  color: string;
  balance: number;
  last4?: string;
  icon?: string;
  senderIds?: string[];
}

export interface Budget {
  id: string;
  category: CategoryType;
  amount: number;
  period: 'monthly';
}

export interface CategoryInfo {
  id: CategoryType;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  isCustom?: boolean;
  type?: 'expense' | 'income' | 'transfer';
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppSettings {
  enableAiInsights: boolean;
  enableLlmFallback: boolean;
  autoCategorizeSms: boolean;
  currency: string;
  openRouterApiKey?: string;
  aiModel: string;
  firstRun: boolean;
  hasOnboarded: boolean;
  hideBalances: boolean;
  themeMode: ThemeMode;
}

export interface ParsedSMS {
  amount: number;
  merchant: string;
  isDebit: boolean;
  upiRef?: string;
  bankAccount?: string;
  bank?: string;
  time: string;
  rawMessage: string;
  senderId?: string;
  confidence?: number;
}

export interface SmartRule {
  id: string;
  keywords: string[];
  category: CategoryType;
  enabled: boolean;
}

export type DateRangeKey = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all' | 'custom';

export interface DateRange {
  key: DateRangeKey;
  label: string;
  start?: string;
  end?: string;
}

export interface MerchantMemory {
  [merchantKey: string]: {
    category: CategoryType;
    tag?: NeedWantTag;
    count: number;
  };
}

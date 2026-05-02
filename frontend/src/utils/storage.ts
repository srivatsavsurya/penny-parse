import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, Account, Budget, AppSettings, CategoryInfo } from '../types';
import { DEFAULT_ACCOUNTS } from './accounts';

const KEYS = {
  TRANSACTIONS: '@pl_transactions_v3',
  ACCOUNTS: '@pl_accounts_v3',
  BUDGETS: '@pl_budgets_v3',
  SETTINGS: '@pl_settings_v3',
  CATEGORIES: '@pl_custom_categories_v3',
};

const DEFAULT_SETTINGS: AppSettings = {
  enableAiInsights: false,
  autoCategorizeSms: true,
  currency: 'INR',
  aiModel: 'google/gemini-2.0-flash-exp:free',
  firstRun: true,
  hasOnboarded: false,
  hideBalances: false,
  themeMode: 'system',
};

export const storage = {
  async loadTransactions(): Promise<Transaction[]> {
    try { const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS); return data ? JSON.parse(data) : []; } catch { return []; }
  },
  async saveTransactions(list: Transaction[]): Promise<void> {
    try { await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list)); } catch {}
  },
  async loadAccounts(): Promise<Account[]> {
    try { const data = await AsyncStorage.getItem(KEYS.ACCOUNTS); return data ? JSON.parse(data) : DEFAULT_ACCOUNTS; } catch { return DEFAULT_ACCOUNTS; }
  },
  async saveAccounts(list: Account[]): Promise<void> {
    try { await AsyncStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(list)); } catch {}
  },
  async loadBudgets(): Promise<Budget[]> {
    try { const data = await AsyncStorage.getItem(KEYS.BUDGETS); return data ? JSON.parse(data) : []; } catch { return []; }
  },
  async saveBudgets(list: Budget[]): Promise<void> {
    try { await AsyncStorage.setItem(KEYS.BUDGETS, JSON.stringify(list)); } catch {}
  },
  async loadSettings(): Promise<AppSettings> {
    try { const data = await AsyncStorage.getItem(KEYS.SETTINGS); return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS; } catch { return DEFAULT_SETTINGS; }
  },
  async saveSettings(s: AppSettings): Promise<void> {
    try { await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(s)); } catch {}
  },
  async loadCustomCategories(): Promise<CategoryInfo[]> {
    try { const data = await AsyncStorage.getItem(KEYS.CATEGORIES); return data ? JSON.parse(data) : []; } catch { return []; }
  },
  async saveCustomCategories(list: CategoryInfo[]): Promise<void> {
    try { await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(list)); } catch {}
  },
  async clearAll(): Promise<void> {
    try { await AsyncStorage.multiRemove(Object.values(KEYS)); } catch {}
  },
};

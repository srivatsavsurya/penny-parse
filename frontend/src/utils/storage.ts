import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, SmartRule, AppSettings } from '../types';
import { DEFAULT_SMART_RULES } from './smartRules';

const KEYS = {
  TRANSACTIONS: '@ledger_transactions',
  SMART_RULES: '@ledger_rules',
  SETTINGS: '@ledger_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  enableAiInsights: false,
  autoCategorizeSms: true,
  currency: 'INR',
};

export const storage = {
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch (e) {
      console.warn('Failed to save transactions:', e);
    }
  },

  async loadTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load transactions:', e);
      return [];
    }
  },

  async saveRules(rules: SmartRule[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SMART_RULES, JSON.stringify(rules));
    } catch (e) {
      console.warn('Failed to save rules:', e);
    }
  },

  async loadRules(): Promise<SmartRule[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SMART_RULES);
      return data ? JSON.parse(data) : DEFAULT_SMART_RULES;
    } catch (e) {
      console.warn('Failed to load rules:', e);
      return DEFAULT_SMART_RULES;
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  async loadSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.warn('Failed to load settings:', e);
      return DEFAULT_SETTINGS;
    }
  },
};

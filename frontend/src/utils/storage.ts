import AsyncStorage from '@react-native-async-storage/async-storage';
import { Transaction, SmartRule } from '../types';
import { DEFAULT_SMART_RULES } from './smartRules';

const TRANSACTIONS_KEY = '@private_ledger_transactions';
const SMART_RULES_KEY = '@private_ledger_smart_rules';

export const saveTransactions = async (transactions: Transaction[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const loadTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveSmartRules = async (rules: SmartRule[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(SMART_RULES_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error('Error saving smart rules:', error);
  }
};

export const loadSmartRules = async (): Promise<SmartRule[]> => {
  try {
    const data = await AsyncStorage.getItem(SMART_RULES_KEY);
    return data ? JSON.parse(data) : DEFAULT_SMART_RULES;
  } catch (error) {
    console.error('Error loading smart rules:', error);
    return DEFAULT_SMART_RULES;
  }
};

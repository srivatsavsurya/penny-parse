import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, SmartRule, AppSettings, CategoryType, ParsedSMS } from '../types';
import { storage } from '../utils/storage';
import { DEMO_TRANSACTIONS } from '../utils/demoData';
import { DEFAULT_SMART_RULES, suggestCategory } from '../utils/smartRules';
import { format } from 'date-fns';
import { smsReceiver } from '../native/smsReceiver';

interface AppContextType {
  transactions: Transaction[];
  rules: SmartRule[];
  settings: AppSettings;
  isLoading: boolean;
  pendingSMS: ParsedSMS | null;
  
  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  
  // SMS actions
  confirmSMS: (sms: ParsedSMS, category: CategoryType) => void;
  dismissSMS: () => void;
  simulateSMS: (message: string) => void;
  
  // Settings
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Helpers
  suggestCategoryFor: (merchant: string) => CategoryType;
  getMonthlySpend: () => number;
  getSpendByCategory: () => { category: CategoryType; amount: number }[];
  
  // Demo
  loadDemo: () => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rules, setRules] = useState<SmartRule[]>(DEFAULT_SMART_RULES);
  const [settings, setSettings] = useState<AppSettings>({
    enableAiInsights: false,
    autoCategorizeSms: true,
    currency: 'INR',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pendingSMS, setPendingSMS] = useState<ParsedSMS | null>(null);

  useEffect(() => {
    loadData();
    setupSMSListener();
    return () => smsReceiver.cleanup();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Initialize SMS receiver (requests notification permissions)
      await smsReceiver.initialize();
      
      const [txs, loadedRules, loadedSettings] = await Promise.all([
        storage.loadTransactions(),
        storage.loadRules(),
        storage.loadSettings(),
      ]);
      
      if (txs.length === 0) {
        setTransactions(DEMO_TRANSACTIONS);
        await storage.saveTransactions(DEMO_TRANSACTIONS);
      } else {
        setTransactions(txs);
      }
      
      setRules(loadedRules);
      setSettings(loadedSettings);
    } catch (e) {
      console.warn('Load error:', e);
      setTransactions(DEMO_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const setupSMSListener = () => {
    smsReceiver.addListener((parsed) => {
      setPendingSMS(parsed);
    });
  };

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updated = transactions.map(t => t.id === id ? { ...t, ...updates } : t);
    setTransactions(updated);
    await storage.saveTransactions(updated);
  }, [transactions]);

  const confirmSMS = useCallback((sms: ParsedSMS, category: CategoryType) => {
    addTransaction({
      amount: sms.amount,
      merchant: sms.merchant,
      category,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'hh:mm a'),
      isCredit: !sms.isDebit,
      upiRef: sms.upiRef,
      bankAccount: sms.bankAccount,
      source: 'sms',
    });
    setPendingSMS(null);
  }, [addTransaction]);

  const dismissSMS = useCallback(() => {
    setPendingSMS(null);
  }, []);

  const simulateSMS = useCallback(async (message: string) => {
    await smsReceiver.simulateSMS(message);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await storage.saveSettings(updated);
  }, [settings]);

  const suggestCategoryFor = useCallback((merchant: string): CategoryType => {
    return suggestCategory(merchant, rules);
  }, [rules]);

  const getMonthlySpend = useCallback((): number => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return transactions
      .filter(t => !t.isCredit && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getSpendByCategory = useCallback(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const spending: Record<string, number> = {};
    
    transactions
      .filter(t => !t.isCredit && t.date.startsWith(currentMonth))
      .forEach(t => {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      });
    
    return Object.entries(spending)
      .map(([category, amount]) => ({ category: category as CategoryType, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const loadDemo = useCallback(async () => {
    setTransactions(DEMO_TRANSACTIONS);
    await storage.saveTransactions(DEMO_TRANSACTIONS);
  }, []);

  const clearData = useCallback(async () => {
    setTransactions([]);
    await storage.saveTransactions([]);
  }, []);

  return (
    <AppContext.Provider value={{
      transactions,
      rules,
      settings,
      isLoading,
      pendingSMS,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      confirmSMS,
      dismissSMS,
      simulateSMS,
      updateSettings,
      suggestCategoryFor,
      getMonthlySpend,
      getSpendByCategory,
      loadDemo,
      clearData,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

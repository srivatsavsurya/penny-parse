import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, CategoryType, AppSettings } from '../types';
import { storage } from '../utils/storage';
import { parseUPIMessage, suggestCategory } from '../utils/upiParser';
import { format } from 'date-fns';

interface ParsedTransaction {
  amount: number;
  merchant: string;
  isDebit: boolean;
  time: string;
}

interface AppContextType {
  transactions: Transaction[];
  settings: AppSettings;
  pendingTransaction: ParsedTransaction | null;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  confirmTransaction: (category: CategoryType) => void;
  dismissTransaction: () => void;
  simulateTransaction: (message: string) => void;
  updateSettings: (updates: Partial<AppSettings>) => void;
  clearData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    enableAiInsights: false,
    autoCategorizeSms: true,
    currency: 'INR',
  });
  const [pendingTransaction, setPendingTransaction] = useState<ParsedTransaction | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [txs, loadedSettings] = await Promise.all([
        storage.loadTransactions(),
        storage.loadSettings(),
      ]);
      setTransactions(txs);
      setSettings(loadedSettings);
    } catch (e) {
      console.warn('Load error:', e);
    }
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

  const confirmTransaction = useCallback((category: CategoryType) => {
    if (!pendingTransaction) return;
    
    addTransaction({
      amount: pendingTransaction.amount,
      merchant: pendingTransaction.merchant,
      category,
      date: format(new Date(), 'yyyy-MM-dd'),
      time: pendingTransaction.time,
      isCredit: !pendingTransaction.isDebit,
      source: 'sms',
    });
    setPendingTransaction(null);
  }, [pendingTransaction, addTransaction]);

  const dismissTransaction = useCallback(() => {
    setPendingTransaction(null);
  }, []);

  const simulateTransaction = useCallback((message: string) => {
    const parsed = parseUPIMessage(message);
    if (parsed) {
      setPendingTransaction({
        amount: parsed.amount,
        merchant: parsed.merchant,
        isDebit: parsed.isDebit,
        time: parsed.time,
      });
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    setSettings(updated);
    await storage.saveSettings(updated);
  }, [settings]);

  const clearData = useCallback(async () => {
    setTransactions([]);
    await storage.saveTransactions([]);
  }, []);

  return (
    <AppContext.Provider value={{
      transactions,
      settings,
      pendingTransaction,
      addTransaction,
      confirmTransaction,
      dismissTransaction,
      simulateTransaction,
      updateSettings,
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

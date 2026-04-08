import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Transaction, SmartRule, CategoryType } from '../types';
import { loadTransactions, saveTransactions, loadSmartRules, saveSmartRules } from '../utils/storage';
import { DEMO_TRANSACTIONS } from '../utils/demoData';
import { DEFAULT_SMART_RULES, suggestCategory } from '../utils/smartRules';
import { format } from 'date-fns';

interface TransactionContextType {
  transactions: Transaction[];
  smartRules: SmartRule[];
  isLoading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  suggestCategoryForMerchant: (merchant: string) => CategoryType | null;
  getTotalSpend: () => number;
  getSpendByCategory: () => { category: CategoryType; amount: number }[];
  getRecentTransactions: (count?: number) => Transaction[];
  loadDemoData: () => void;
  clearAllData: () => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [smartRules, setSmartRules] = useState<SmartRule[]>(DEFAULT_SMART_RULES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [loadedTransactions, loadedRules] = await Promise.all([
        loadTransactions(),
        loadSmartRules(),
      ]);
      
      // If no transactions, load demo data
      if (loadedTransactions.length === 0) {
        setTransactions(DEMO_TRANSACTIONS);
        await saveTransactions(DEMO_TRANSACTIONS);
      } else {
        setTransactions(loadedTransactions);
      }
      
      setSmartRules(loadedRules);
    } catch (error) {
      console.error('Error loading data:', error);
      setTransactions(DEMO_TRANSACTIONS);
    } finally {
      setIsLoading(false);
    }
  };

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
    };
    
    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);
  }, [transactions]);

  const deleteTransaction = useCallback(async (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);
  }, [transactions]);

  const updateTransaction = useCallback(async (id: string, updates: Partial<Transaction>) => {
    const updatedTransactions = transactions.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTransactions(updatedTransactions);
    await saveTransactions(updatedTransactions);
  }, [transactions]);

  const suggestCategoryForMerchant = useCallback((merchant: string): CategoryType | null => {
    return suggestCategory(merchant, smartRules);
  }, [smartRules]);

  const getTotalSpend = useCallback((): number => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    return transactions
      .filter(t => !t.isCredit && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getSpendByCategory = useCallback(() => {
    const currentMonth = format(new Date(), 'yyyy-MM');
    const categorySpend: { [key: string]: number } = {};
    
    transactions
      .filter(t => !t.isCredit && t.date.startsWith(currentMonth))
      .forEach(t => {
        categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
      });
    
    return Object.entries(categorySpend)
      .map(([category, amount]) => ({ category: category as CategoryType, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  const getRecentTransactions = useCallback((count: number = 5): Transaction[] => {
    return [...transactions]
      .sort((a, b) => {
        const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      })
      .slice(0, count);
  }, [transactions]);

  const loadDemoData = useCallback(async () => {
    setTransactions(DEMO_TRANSACTIONS);
    await saveTransactions(DEMO_TRANSACTIONS);
  }, []);

  const clearAllData = useCallback(async () => {
    setTransactions([]);
    await saveTransactions([]);
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        smartRules,
        isLoading,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        suggestCategoryForMerchant,
        getTotalSpend,
        getSpendByCategory,
        getRecentTransactions,
        loadDemoData,
        clearAllData,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = (): TransactionContextType => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

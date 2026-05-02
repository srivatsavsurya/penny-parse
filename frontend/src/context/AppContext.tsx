import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Transaction, CategoryType, AppSettings, Account, Budget, ParsedSMS } from '../types';
import { storage } from '../utils/storage';
import { parseUPIMessage, suggestCategory } from '../utils/upiParser';
import { findAccountBySender } from '../utils/accounts';
import { format } from 'date-fns';

interface PendingTx {
  amount: number;
  merchant: string;
  isDebit: boolean;
  time: string;
  accountId?: string;
  upiRef?: string;
  bankAccount?: string;
}

interface AppContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  settings: AppSettings;
  pendingTransaction: PendingTx | null;
  ready: boolean;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  confirmTransaction: (category: CategoryType, accountId?: string, notes?: string) => void;
  dismissTransaction: () => void;
  simulateTransaction: (message: string, senderId?: string) => void;
  triggerParsedSMS: (parsed: ParsedSMS) => void;

  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  setBudget: (category: CategoryType, amount: number) => void;
  deleteBudget: (id: string) => void;

  updateSettings: (updates: Partial<AppSettings>) => void;
  clearData: () => void;
  seedDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const id = () => Math.random().toString(36).substring(2, 11) + Date.now().toString(36);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    enableAiInsights: false,
    autoCategorizeSms: true,
    currency: 'INR',
    aiModel: 'google/gemini-2.0-flash-exp:free',
    firstRun: true,
  });
  const [pendingTransaction, setPendingTransaction] = useState<PendingTx | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [txs, accs, buds, sets] = await Promise.all([
        storage.loadTransactions(),
        storage.loadAccounts(),
        storage.loadBudgets(),
        storage.loadSettings(),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setBudgets(buds);
      setSettings(sets);
      setReady(true);
    })();
  }, []);

  const persistTransactions = (list: Transaction[]) => {
    setTransactions(list);
    storage.saveTransactions(list);
  };
  const persistAccounts = (list: Account[]) => {
    setAccounts(list);
    storage.saveAccounts(list);
  };
  const persistBudgets = (list: Budget[]) => {
    setBudgets(list);
    storage.saveBudgets(list);
  };
  const persistSettings = (s: AppSettings) => {
    setSettings(s);
    storage.saveSettings(s);
  };

  const addTransaction: AppContextType['addTransaction'] = useCallback(
    (tx) => {
      const newTx: Transaction = { ...tx, id: id(), createdAt: Date.now() };
      persistTransactions([newTx, ...transactions]);
    },
    [transactions]
  );

  const updateTransaction: AppContextType['updateTransaction'] = useCallback(
    (txId, updates) => {
      persistTransactions(transactions.map((t) => (t.id === txId ? { ...t, ...updates } : t)));
    },
    [transactions]
  );

  const deleteTransaction: AppContextType['deleteTransaction'] = useCallback(
    (txId) => {
      persistTransactions(transactions.filter((t) => t.id !== txId));
    },
    [transactions]
  );

  const triggerParsedSMS: AppContextType['triggerParsedSMS'] = useCallback(
    (parsed) => {
      const acc = findAccountBySender(accounts, parsed.senderId || parsed.bank);
      setPendingTransaction({
        amount: parsed.amount,
        merchant: parsed.merchant,
        isDebit: parsed.isDebit,
        time: parsed.time,
        accountId: acc?.id,
        upiRef: parsed.upiRef,
        bankAccount: parsed.bankAccount,
      });
    },
    [accounts]
  );

  const confirmTransaction: AppContextType['confirmTransaction'] = useCallback(
    (category, accountId, notes) => {
      if (!pendingTransaction) return;
      const newTx: Transaction = {
        id: id(),
        amount: pendingTransaction.amount,
        merchant: pendingTransaction.merchant,
        category: pendingTransaction.isDebit ? category : 'income',
        accountId: accountId || pendingTransaction.accountId,
        date: format(new Date(), 'yyyy-MM-dd'),
        time: pendingTransaction.time,
        isCredit: !pendingTransaction.isDebit,
        source: 'sms',
        upiRef: pendingTransaction.upiRef,
        bankAccount: pendingTransaction.bankAccount,
        notes,
        createdAt: Date.now(),
      };
      persistTransactions([newTx, ...transactions]);
      setPendingTransaction(null);
    },
    [pendingTransaction, transactions]
  );

  const dismissTransaction = useCallback(() => setPendingTransaction(null), []);

  const simulateTransaction: AppContextType['simulateTransaction'] = useCallback(
    (message, senderId) => {
      const parsed = parseUPIMessage(message, senderId);
      if (parsed) triggerParsedSMS(parsed);
    },
    [triggerParsedSMS]
  );

  const addAccount: AppContextType['addAccount'] = useCallback(
    (acc) => persistAccounts([...accounts, { ...acc, id: id() }]),
    [accounts]
  );

  const updateAccount: AppContextType['updateAccount'] = useCallback(
    (accId, updates) =>
      persistAccounts(accounts.map((a) => (a.id === accId ? { ...a, ...updates } : a))),
    [accounts]
  );

  const deleteAccount: AppContextType['deleteAccount'] = useCallback(
    (accId) => persistAccounts(accounts.filter((a) => a.id !== accId)),
    [accounts]
  );

  const setBudget: AppContextType['setBudget'] = useCallback(
    (category, amount) => {
      const existing = budgets.find((b) => b.category === category);
      if (existing) {
        persistBudgets(budgets.map((b) => (b.id === existing.id ? { ...b, amount } : b)));
      } else {
        persistBudgets([...budgets, { id: id(), category, amount, period: 'monthly' }]);
      }
    },
    [budgets]
  );

  const deleteBudget: AppContextType['deleteBudget'] = useCallback(
    (bid) => persistBudgets(budgets.filter((b) => b.id !== bid)),
    [budgets]
  );

  const updateSettings: AppContextType['updateSettings'] = useCallback(
    (updates) => persistSettings({ ...settings, ...updates }),
    [settings]
  );

  const clearData: AppContextType['clearData'] = useCallback(() => {
    persistTransactions([]);
    persistBudgets([]);
  }, []);

  const seedDemoData: AppContextType['seedDemoData'] = useCallback(async () => {
    const { DEMO_TRANSACTIONS } = await import('../utils/demoData');
    persistTransactions(DEMO_TRANSACTIONS);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      transactions,
      accounts,
      budgets,
      settings,
      pendingTransaction,
      ready,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      confirmTransaction,
      dismissTransaction,
      simulateTransaction,
      triggerParsedSMS,
      addAccount,
      updateAccount,
      deleteAccount,
      setBudget,
      deleteBudget,
      updateSettings,
      clearData,
      seedDemoData,
    }),
    [
      transactions, accounts, budgets, settings, pendingTransaction, ready,
      addTransaction, updateTransaction, deleteTransaction,
      confirmTransaction, dismissTransaction, simulateTransaction, triggerParsedSMS,
      addAccount, updateAccount, deleteAccount,
      setBudget, deleteBudget,
      updateSettings, clearData, seedDemoData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

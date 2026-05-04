import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Transaction, CategoryType, AppSettings, Account, Budget, ParsedSMS, CategoryInfo } from '../types';
import { storage } from '../utils/storage';
import { parseUPIMessage, suggestCategory } from '../utils/upiParser';
import { findAccountBySender } from '../utils/accounts';
import { format } from 'date-fns';

export interface PendingTx {
  id?: string; // present when editing existing
  amount: number;
  merchant: string;
  isDebit: boolean;
  time: string;
  date?: string;
  accountId?: string;
  upiRef?: string;
  bankAccount?: string;
  notes?: string;
  category?: CategoryType;
  isEdit?: boolean;
}

interface AppContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  settings: AppSettings;
  customCategories: CategoryInfo[];
  pendingTransaction: PendingTx | null;
  ready: boolean;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Banner / Pending flow
  confirmTransaction: (data: { category: CategoryType; accountId?: string; notes?: string; date?: string; time?: string; amount?: number; merchant?: string }) => void;
  dismissTransaction: () => void;
  simulateTransaction: (message: string, senderId?: string) => void;
  triggerParsedSMS: (parsed: ParsedSMS) => void;
  openTransactionEditor: (tx: Transaction) => void;
  openManualEntry: (isDebit?: boolean) => void;

  // Accounts
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Custom Categories
  addCustomCategory: (cat: Omit<CategoryInfo, 'id' | 'isCustom'>) => void;
  updateCustomCategory: (id: string, updates: Partial<CategoryInfo>) => void;
  deleteCustomCategory: (id: string) => void;

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
  const [customCategories, setCustomCategories] = useState<CategoryInfo[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    enableAiInsights: false,
    autoCategorizeSms: true,
    currency: 'INR',
    aiModel: 'google/gemini-2.0-flash-exp:free',
    firstRun: true,
    hasOnboarded: false,
    hideBalances: false,
    themeMode: 'system',
  });
  const [pendingTransaction, setPendingTransaction] = useState<PendingTx | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [txs, accs, buds, sets, cats] = await Promise.all([
        storage.loadTransactions(),
        storage.loadAccounts(),
        storage.loadBudgets(),
        storage.loadSettings(),
        storage.loadCustomCategories(),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setBudgets(buds);
      setSettings(sets);
      setCustomCategories(cats);
      setReady(true);
    })();
  }, []);

  const persistTransactions = (list: Transaction[]) => { setTransactions(list); storage.saveTransactions(list); };
  const persistAccounts = (list: Account[]) => { setAccounts(list); storage.saveAccounts(list); };
  const persistBudgets = (list: Budget[]) => { setBudgets(list); storage.saveBudgets(list); };
  const persistSettings = (s: AppSettings) => { setSettings(s); storage.saveSettings(s); };
  const persistCategories = (list: CategoryInfo[]) => { setCustomCategories(list); storage.saveCustomCategories(list); };

  const addTransaction: AppContextType['addTransaction'] = useCallback((tx) => {
    const newTx: Transaction = { ...tx, id: id(), createdAt: Date.now() };
    persistTransactions([newTx, ...transactions]);
  }, [transactions]);

  const updateTransaction: AppContextType['updateTransaction'] = useCallback((txId, updates) => {
    persistTransactions(transactions.map((t) => (t.id === txId ? { ...t, ...updates } : t)));
  }, [transactions]);

  const deleteTransaction: AppContextType['deleteTransaction'] = useCallback((txId) => {
    persistTransactions(transactions.filter((t) => t.id !== txId));
  }, [transactions]);

  const triggerParsedSMS: AppContextType['triggerParsedSMS'] = useCallback((parsed) => {
    const acc = findAccountBySender(accounts, parsed.senderId || parsed.bank);
    setPendingTransaction({
      amount: parsed.amount,
      merchant: parsed.merchant,
      isDebit: parsed.isDebit,
      time: parsed.time,
      date: format(new Date(), 'yyyy-MM-dd'),
      accountId: acc?.id,
      upiRef: parsed.upiRef,
      bankAccount: parsed.bankAccount,
      category: suggestCategory(parsed.merchant, !parsed.isDebit) as CategoryType,
    });
  }, [accounts]);

  const openTransactionEditor: AppContextType['openTransactionEditor'] = useCallback((tx) => {
    setPendingTransaction({
      id: tx.id,
      amount: tx.amount,
      merchant: tx.merchant,
      isDebit: !tx.isCredit,
      time: tx.time,
      date: tx.date,
      accountId: tx.accountId,
      upiRef: tx.upiRef,
      bankAccount: tx.bankAccount,
      notes: tx.notes,
      category: tx.category,
      isEdit: true,
    });
  }, []);

  const openManualEntry: AppContextType['openManualEntry'] = useCallback((isDebit = true) => {
    const now = new Date();
    setPendingTransaction({
      amount: 0,
      merchant: '',
      isDebit,
      time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: format(now, 'yyyy-MM-dd'),
      accountId: accounts[0]?.id,
      category: isDebit ? 'others' : 'income',
    });
  }, [accounts]);

  const confirmTransaction: AppContextType['confirmTransaction'] = useCallback((data) => {
    if (!pendingTransaction) return;
    const isDebit = pendingTransaction.isDebit;
    const finalAmount = data.amount ?? pendingTransaction.amount;
    const finalMerchant = data.merchant ?? pendingTransaction.merchant;
    const finalDate = data.date || pendingTransaction.date || format(new Date(), 'yyyy-MM-dd');
    const finalTime = data.time || pendingTransaction.time;

    if (pendingTransaction.isEdit && pendingTransaction.id) {
      // Update existing
      const updated = transactions.map((t) =>
        t.id === pendingTransaction.id
          ? {
              ...t,
              amount: finalAmount,
              merchant: finalMerchant,
              category: data.category,
              accountId: data.accountId,
              date: finalDate,
              time: finalTime,
              notes: data.notes,
            }
          : t
      );
      persistTransactions(updated);
    } else {
      // New
      const newTx: Transaction = {
        id: id(),
        amount: finalAmount,
        merchant: finalMerchant,
        category: isDebit ? data.category : 'income',
        accountId: data.accountId || pendingTransaction.accountId,
        date: finalDate,
        time: finalTime,
        isCredit: !isDebit,
        source: 'sms',
        upiRef: pendingTransaction.upiRef,
        bankAccount: pendingTransaction.bankAccount,
        notes: data.notes,
        createdAt: Date.now(),
      };
      persistTransactions([newTx, ...transactions]);
    }
    setPendingTransaction(null);
  }, [pendingTransaction, transactions]);

  const dismissTransaction = useCallback(() => setPendingTransaction(null), []);

  const simulateTransaction: AppContextType['simulateTransaction'] = useCallback((message, senderId) => {
    const parsed = parseUPIMessage(message, senderId);
    if (parsed) triggerParsedSMS(parsed);
  }, [triggerParsedSMS]);

  const addAccount: AppContextType['addAccount'] = useCallback(
    (acc) => persistAccounts([...accounts, { ...acc, id: id() }]),
    [accounts]
  );
  const updateAccount: AppContextType['updateAccount'] = useCallback(
    (accId, updates) => persistAccounts(accounts.map((a) => (a.id === accId ? { ...a, ...updates } : a))),
    [accounts]
  );
  const deleteAccount: AppContextType['deleteAccount'] = useCallback(
    (accId) => persistAccounts(accounts.filter((a) => a.id !== accId)),
    [accounts]
  );

  const addCustomCategory: AppContextType['addCustomCategory'] = useCallback(
    (cat) => persistCategories([...customCategories, { ...cat, id: 'custom_' + id(), isCustom: true }]),
    [customCategories]
  );
  const updateCustomCategory: AppContextType['updateCustomCategory'] = useCallback(
    (cid, updates) => persistCategories(customCategories.map((c) => (c.id === cid ? { ...c, ...updates } : c))),
    [customCategories]
  );
  const deleteCustomCategory: AppContextType['deleteCustomCategory'] = useCallback(
    (cid) => persistCategories(customCategories.filter((c) => c.id !== cid)),
    [customCategories]
  );

  const setBudget: AppContextType['setBudget'] = useCallback((category, amount) => {
    const existing = budgets.find((b) => b.category === category);
    if (existing) persistBudgets(budgets.map((b) => (b.id === existing.id ? { ...b, amount } : b)));
    else persistBudgets([...budgets, { id: id(), category, amount, period: 'monthly' }]);
  }, [budgets]);

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
      transactions, accounts, budgets, settings, customCategories, pendingTransaction, ready,
      addTransaction, updateTransaction, deleteTransaction,
      confirmTransaction, dismissTransaction, simulateTransaction, triggerParsedSMS, openTransactionEditor, openManualEntry,
      addAccount, updateAccount, deleteAccount,
      addCustomCategory, updateCustomCategory, deleteCustomCategory,
      setBudget, deleteBudget,
      updateSettings, clearData, seedDemoData,
    }),
    [
      transactions, accounts, budgets, settings, customCategories, pendingTransaction, ready,
      addTransaction, updateTransaction, deleteTransaction,
      confirmTransaction, dismissTransaction, simulateTransaction, triggerParsedSMS, openTransactionEditor, openManualEntry,
      addAccount, updateAccount, deleteAccount,
      addCustomCategory, updateCustomCategory, deleteCustomCategory,
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

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { Transaction, CategoryType, AppSettings, Account, Budget, ParsedSMS, CategoryInfo, MerchantMemory, NeedWantTag } from '../types';
import { storage } from '../utils/storage';
import { parseUPIMessage, suggestCategory, merchantKey, parseWithLLM } from '../utils/upiParser';
import { findAccountBySender } from '../utils/accounts';
import { format } from 'date-fns';

export interface PendingTx {
  id?: string;
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
  tag?: NeedWantTag;
  parseConfidence?: number;
  isEdit?: boolean;
}

interface AppContextType {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  settings: AppSettings;
  customCategories: CategoryInfo[];
  merchantMemory: MerchantMemory;
  pendingTransaction: PendingTx | null;
  ready: boolean;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Banner / Pending flow
  confirmTransaction: (data: { category: CategoryType; tag?: NeedWantTag; accountId?: string; notes?: string; date?: string; time?: string; amount?: number; merchant?: string }) => void;
  dismissTransaction: () => void;
  simulateTransaction: (message: string, senderId?: string) => void;
  triggerParsedSMS: (parsed: ParsedSMS) => void;
  openTransactionEditor: (tx: Transaction) => void;
  openManualEntry: (isDebit?: boolean) => void;
  parseRawSMS: (raw: string) => Promise<boolean>;

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
  const [merchantMemory, setMerchantMemory] = useState<MerchantMemory>({});
  const [settings, setSettings] = useState<AppSettings>({
    enableAiInsights: false,
    enableLlmFallback: false,
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
      const [txs, accs, buds, sets, cats, mem] = await Promise.all([
        storage.loadTransactions(),
        storage.loadAccounts(),
        storage.loadBudgets(),
        storage.loadSettings(),
        storage.loadCustomCategories(),
        storage.loadMerchantMemory(),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setBudgets(buds);
      setSettings(sets);
      setCustomCategories(cats);
      setMerchantMemory(mem);
      setReady(true);
    })();
  }, []);

  const persistTransactions = (list: Transaction[]) => { setTransactions(list); storage.saveTransactions(list); };
  const persistAccounts = (list: Account[]) => { setAccounts(list); storage.saveAccounts(list); };
  const persistBudgets = (list: Budget[]) => { setBudgets(list); storage.saveBudgets(list); };
  const persistSettings = (s: AppSettings) => { setSettings(s); storage.saveSettings(s); };
  const persistCategories = (list: CategoryInfo[]) => { setCustomCategories(list); storage.saveCustomCategories(list); };
  const persistMerchantMemory = (m: MerchantMemory) => { setMerchantMemory(m); storage.saveMerchantMemory(m); };

  const learnMerchant = (merchant: string, category: CategoryType, tag?: NeedWantTag) => {
    const k = merchantKey(merchant);
    if (!k) return;
    const prev = merchantMemory[k];
    persistMerchantMemory({
      ...merchantMemory,
      [k]: {
        category,
        tag: tag || prev?.tag,
        count: (prev?.count || 0) + 1,
      },
    });
  };

  const lookupMerchant = (merchant: string) => {
    const k = merchantKey(merchant);
    return merchantMemory[k];
  };

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
    const memory = lookupMerchant(parsed.merchant);
    // Merchant memory wins over keyword-based suggestion
    const suggestedCat = memory?.category || (suggestCategory(parsed.merchant, !parsed.isDebit) as CategoryType);
    setPendingTransaction({
      amount: parsed.amount,
      merchant: parsed.merchant,
      isDebit: parsed.isDebit,
      time: parsed.time,
      date: format(new Date(), 'yyyy-MM-dd'),
      accountId: acc?.id,
      upiRef: parsed.upiRef,
      bankAccount: parsed.bankAccount,
      category: suggestedCat,
      tag: memory?.tag || 'unset',
      parseConfidence: parsed.confidence,
    });
  }, [accounts, merchantMemory]);

  const parseRawSMS: AppContextType['parseRawSMS'] = useCallback(async (raw: string) => {
    // Layer 1: template regex
    const local = parseUPIMessage(raw);
    if (local) { triggerParsedSMS(local); return true; }
    // Layer 2: LLM fallback (opt-in)
    if (settings.enableLlmFallback && settings.openRouterApiKey) {
      const llm = await parseWithLLM(raw, settings.openRouterApiKey, settings.aiModel);
      if (llm) { triggerParsedSMS(llm); return true; }
    }
    return false;
  }, [settings, triggerParsedSMS]);

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
      tag: tx.tag || 'unset',
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
      tag: 'unset',
    });
  }, [accounts]);

  const confirmTransaction: AppContextType['confirmTransaction'] = useCallback((data) => {
    if (!pendingTransaction) return;
    const isDebit = pendingTransaction.isDebit;
    const finalAmount = data.amount ?? pendingTransaction.amount;
    const finalMerchant = data.merchant ?? pendingTransaction.merchant;
    const finalDate = data.date || pendingTransaction.date || format(new Date(), 'yyyy-MM-dd');
    const finalTime = data.time || pendingTransaction.time;
    const finalTag: NeedWantTag = data.tag || pendingTransaction.tag || 'unset';

    // Learn from the user's choice for future auto-categorization
    if (finalMerchant) learnMerchant(finalMerchant, data.category, finalTag);

    if (pendingTransaction.isEdit && pendingTransaction.id) {
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
              tag: finalTag,
            }
          : t
      );
      persistTransactions(updated);
    } else {
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
        tag: finalTag,
        parseConfidence: pendingTransaction.parseConfidence,
        createdAt: Date.now(),
      };
      persistTransactions([newTx, ...transactions]);
    }
    setPendingTransaction(null);
  }, [pendingTransaction, transactions, merchantMemory]);

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
      transactions, accounts, budgets, settings, customCategories, merchantMemory, pendingTransaction, ready,
      addTransaction, updateTransaction, deleteTransaction,
      confirmTransaction, dismissTransaction, simulateTransaction, triggerParsedSMS, openTransactionEditor, openManualEntry, parseRawSMS,
      addAccount, updateAccount, deleteAccount,
      addCustomCategory, updateCustomCategory, deleteCustomCategory,
      setBudget, deleteBudget,
      updateSettings, clearData, seedDemoData,
    }),
    [
      transactions, accounts, budgets, settings, customCategories, merchantMemory, pendingTransaction, ready,
      addTransaction, updateTransaction, deleteTransaction,
      confirmTransaction, dismissTransaction, simulateTransaction, triggerParsedSMS, openTransactionEditor, openManualEntry, parseRawSMS,
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

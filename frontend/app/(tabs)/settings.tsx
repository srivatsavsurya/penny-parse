import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme/design';
import { EXPENSE_CATEGORIES, getCategoryInfo } from '../../src/utils/categories';
import { BANK_COLORS, getAccountIcon } from '../../src/utils/accounts';
import { AccountType, CategoryType } from '../../src/types';
import { formatCompact } from '../../src/utils/formatters';

export default function SettingsScreen() {
  const {
    settings,
    updateSettings,
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    budgets,
    setBudget,
    deleteBudget,
    transactions,
    clearData,
    seedDemoData,
  } = useApp();

  const [showApiKey, setShowApiKey] = useState(false);
  const [accountModal, setAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [budgetModal, setBudgetModal] = useState(false);

  const confirm = (title: string, msg: string, onYes: () => void) => {
    if (Platform.OS === 'web') {
      if (window.confirm(msg)) onYes();
    } else {
      Alert.alert(title, msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', style: 'destructive', onPress: onYes },
      ]);
    }
  };

  const exportCSV = () => {
    if (transactions.length === 0) {
      Alert.alert('No data', 'Nothing to export.');
      return;
    }
    const header = 'Date,Time,Merchant,Category,Amount,Type,Account,Notes,UPI Ref\n';
    const rows = transactions.map((t) => {
      const acc = accounts.find((a) => a.id === t.accountId)?.name || '';
      const cat = getCategoryInfo(t.category).name;
      const type = t.isCredit ? 'Credit' : 'Debit';
      const notes = (t.notes || '').replace(/,/g, ';');
      return `${t.date},${t.time},"${t.merchant}",${cat},${t.amount},${type},${acc},"${notes}",${t.upiRef || ''}`;
    });
    const csv = header + rows.join('\n');
    if (Platform.OS === 'web') {
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `private-ledger-${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      Alert.alert('Export', 'CSV export on mobile requires file-sharing integration (coming soon). Data is available in-app.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences &amp; data</Text>

        {/* AI Section */}
        <Section title="AI Insights" subtitle="Powered by OpenRouter">
          <Row
            icon="sparkles"
            iconColor={colors.accent}
            iconBg={colors.infoBg}
            title="Enable AI insights"
            subtitle="Use AI to analyze your spending"
            right={
              <Switch
                value={settings.enableAiInsights}
                onValueChange={(v) => updateSettings({ enableAiInsights: v })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            }
          />
          <Divider />
          <View style={styles.apiRow}>
            <Text style={styles.apiLabel}>OpenRouter API Key</Text>
            <View style={styles.apiInputWrap}>
              <TextInput
                value={settings.openRouterApiKey || ''}
                onChangeText={(v) => updateSettings({ openRouterApiKey: v })}
                placeholder="sk-or-v1-…"
                placeholderTextColor={colors.textTertiary}
                style={styles.apiInput}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowApiKey(!showApiKey)} style={styles.eyeBtn}>
                <Ionicons name={showApiKey ? 'eye-off' : 'eye'} size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'web') {
                  window.open('https://openrouter.ai/keys', '_blank');
                } else {
                  Alert.alert('Get API key', 'Visit openrouter.ai/keys in your browser.');
                }
              }}
            >
              <Text style={styles.apiHint}>
                Get free key → openrouter.ai/keys
              </Text>
            </TouchableOpacity>
          </View>
          <Divider />
          <Row
            icon="hardware-chip-outline"
            iconColor={colors.textPrimary}
            iconBg={colors.surface}
            title="Model"
            subtitle={settings.aiModel}
            onPress={() => {
              const models = [
                'google/gemini-2.0-flash-exp:free',
                'meta-llama/llama-3.2-3b-instruct:free',
                'microsoft/phi-3-medium-128k-instruct:free',
                'mistralai/mistral-7b-instruct:free',
              ];
              const idx = models.indexOf(settings.aiModel);
              updateSettings({ aiModel: models[(idx + 1) % models.length] });
            }}
          />
        </Section>

        {/* Accounts */}
        <Section title="Accounts" subtitle={accounts.length + ' account' + (accounts.length !== 1 ? 's' : '')}>
          {accounts.map((acc, i) => (
            <View key={acc.id}>
              <Row
                icon={(acc.icon || getAccountIcon(acc.type)) as any}
                iconColor="#fff"
                iconBg={acc.color}
                title={acc.name}
                subtitle={(acc.bank || acc.type) + (acc.last4 ? ' · ' + acc.last4 : '')}
                onPress={() => { setEditingAccount(acc); setAccountModal(true); }}
              />
              {i < accounts.length - 1 && <Divider />}
            </View>
          ))}
          <Divider />
          <Row
            icon="add-circle-outline"
            iconColor={colors.accent}
            iconBg={colors.infoBg}
            title="Add account"
            subtitle="Bank, card, wallet or cash"
            onPress={() => { setEditingAccount(null); setAccountModal(true); }}
          />
        </Section>

        {/* Budgets */}
        <Section title="Budgets" subtitle="Monthly caps per category">
          {budgets.length === 0 ? (
            <Text style={styles.emptyInline}>No budgets set yet</Text>
          ) : (
            budgets.map((b, i) => {
              const info = getCategoryInfo(b.category);
              return (
                <View key={b.id}>
                  <Row
                    icon={info.icon}
                    iconColor={info.color}
                    iconBg={info.bgColor}
                    title={info.name}
                    subtitle={'Monthly · ₹' + formatCompact(b.amount)}
                    right={
                      <TouchableOpacity onPress={() => deleteBudget(b.id)}>
                        <Ionicons name="trash-outline" size={18} color={colors.textTertiary} />
                      </TouchableOpacity>
                    }
                  />
                  {i < budgets.length - 1 && <Divider />}
                </View>
              );
            })
          )}
          <Divider />
          <Row
            icon="add-circle-outline"
            iconColor={colors.accent}
            iconBg={colors.infoBg}
            title="Add budget"
            subtitle="Set a monthly cap"
            onPress={() => setBudgetModal(true)}
          />
        </Section>

        {/* Preferences */}
        <Section title="Preferences">
          <Row
            icon="flash-outline"
            iconColor={colors.warning}
            iconBg={colors.warningBg}
            title="Auto-categorize SMS"
            subtitle="Suggest category from merchant name"
            right={
              <Switch
                value={settings.autoCategorizeSms}
                onValueChange={(v) => updateSettings({ autoCategorizeSms: v })}
                trackColor={{ false: colors.border, true: colors.accent }}
                thumbColor="#fff"
              />
            }
          />
        </Section>

        {/* Data */}
        <Section title="Data">
          <Row
            icon="download-outline"
            iconColor={colors.info}
            iconBg={colors.infoBg}
            title="Export CSV"
            subtitle="Download all transactions"
            onPress={exportCSV}
          />
          <Divider />
          <Row
            icon="flash-outline"
            iconColor={colors.warning}
            iconBg={colors.warningBg}
            title="Load demo data"
            subtitle="Populate with sample transactions"
            onPress={() => confirm('Load demo', 'Replace existing transactions with demo data?', seedDemoData)}
          />
          <Divider />
          <Row
            icon="trash-outline"
            iconColor={colors.error}
            iconBg={colors.errorBg}
            title="Clear all data"
            subtitle="Delete transactions and budgets"
            onPress={() => confirm('Clear data', 'This will permanently delete all your data. Continue?', clearData)}
          />
        </Section>

        {/* About */}
        <Section title="About">
          <Row
            icon="shield-checkmark-outline"
            iconColor={colors.success}
            iconBg={colors.successBg}
            title="100% Private"
            subtitle="All data stays on your device"
          />
          <Divider />
          <Row
            icon="information-circle-outline"
            iconColor={colors.textSecondary}
            iconBg={colors.surface}
            title="Version"
            subtitle="1.0.0"
          />
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>

      <AccountModal
        visible={accountModal}
        account={editingAccount}
        onClose={() => setAccountModal(false)}
        onSave={(data) => {
          if (editingAccount) updateAccount(editingAccount.id, data);
          else addAccount(data);
          setAccountModal(false);
        }}
        onDelete={
          editingAccount
            ? () => {
                confirm('Delete account', 'Remove this account? Transactions will be kept.', () => {
                  deleteAccount(editingAccount.id);
                  setAccountModal(false);
                });
              }
            : undefined
        }
      />

      <BudgetModal
        visible={budgetModal}
        onClose={() => setBudgetModal(false)}
        onSave={(cat, amount) => {
          setBudget(cat, amount);
          setBudgetModal(false);
        }}
      />
    </SafeAreaView>
  );
}

// Helpers
const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
    </View>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

const Row: React.FC<{
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}> = ({ icon, iconColor, iconBg, title, subtitle, right, onPress }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
    <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.rowTitle}>{title}</Text>
      {subtitle ? <Text style={styles.rowSub}>{subtitle}</Text> : null}
    </View>
    {right || (onPress && <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />)}
  </TouchableOpacity>
);

const Divider = () => <View style={styles.divider} />;

// Account modal
const ACCOUNT_COLORS = ['#004C8F', '#1E40AF', '#F58220', '#97144D', '#ED232A', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'];
const ACCOUNT_TYPES: AccountType[] = ['bank', 'card', 'cash', 'wallet'];

const AccountModal: React.FC<{
  visible: boolean;
  account: any | null;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: () => void;
}> = ({ visible, account, onClose, onSave, onDelete }) => {
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [last4, setLast4] = useState('');
  const [balance, setBalance] = useState('');

  React.useEffect(() => {
    if (account) {
      setName(account.name || '');
      setBank(account.bank || '');
      setType(account.type || 'bank');
      setColor(account.color || ACCOUNT_COLORS[0]);
      setLast4(account.last4 || '');
      setBalance(String(account.balance || ''));
    } else {
      setName(''); setBank(''); setType('bank'); setColor(ACCOUNT_COLORS[0]); setLast4(''); setBalance('');
    }
  }, [account, visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      bank: bank.trim() || undefined,
      type,
      color,
      last4: last4.trim() || undefined,
      balance: parseFloat(balance) || 0,
      icon: getAccountIcon(type),
      senderIds: bank ? [bank.toUpperCase()] : [],
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={modalStyles.title}>{account ? 'Edit Account' : 'New Account'}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={modalStyles.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          <Field label="Name" value={name} onChange={setName} placeholder="e.g., HDFC Savings" />
          <Field label="Bank / Issuer" value={bank} onChange={setBank} placeholder="HDFC, SBI, ICICI… (optional)" />
          <View>
            <Text style={modalStyles.label}>Type</Text>
            <View style={modalStyles.chipRow}>
              {ACCOUNT_TYPES.map((t) => (
                <TouchableOpacity key={t} style={[modalStyles.chip, type === t && modalStyles.chipActive]} onPress={() => setType(t)}>
                  <Text style={[modalStyles.chipText, type === t && modalStyles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View>
            <Text style={modalStyles.label}>Color</Text>
            <View style={modalStyles.chipRow}>
              {ACCOUNT_COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[modalStyles.colorSwatch, { backgroundColor: c }, color === c && modalStyles.colorSelected]}
                  onPress={() => setColor(c)}
                />
              ))}
            </View>
          </View>
          <Field label="Last 4 digits (optional)" value={last4} onChange={setLast4} placeholder="1234" keyboardType="number-pad" maxLength={4} />
          <Field label="Initial balance (optional)" value={balance} onChange={setBalance} placeholder="0" keyboardType="numeric" />
          {onDelete ? (
            <TouchableOpacity onPress={onDelete} style={modalStyles.deleteBtn}>
              <Ionicons name="trash-outline" size={16} color={colors.error} />
              <Text style={modalStyles.deleteText}>Delete account</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const BudgetModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSave: (cat: CategoryType, amount: number) => void;
}> = ({ visible, onClose, onSave }) => {
  const [selected, setSelected] = useState<CategoryType>('food');
  const [amount, setAmount] = useState('');

  React.useEffect(() => {
    if (visible) { setAmount(''); setSelected('food'); }
  }, [visible]);

  const handleSave = () => {
    const n = parseFloat(amount);
    if (!n || n <= 0) return;
    onSave(selected, n);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface }}>
        <View style={modalStyles.header}>
          <TouchableOpacity onPress={onClose}><Text style={modalStyles.cancel}>Cancel</Text></TouchableOpacity>
          <Text style={modalStyles.title}>New Budget</Text>
          <TouchableOpacity onPress={handleSave}><Text style={modalStyles.save}>Save</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
          <View>
            <Text style={modalStyles.label}>Category</Text>
            <View style={modalStyles.chipRow}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[modalStyles.chip, selected === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setSelected(cat.id)}
                >
                  <Ionicons name={cat.icon as any} size={13} color={selected === cat.id ? '#fff' : cat.color} />
                  <Text style={[modalStyles.chipText, { marginLeft: 5 }, selected === cat.id && modalStyles.chipTextActive]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <Field label="Monthly cap" value={amount} onChange={setAmount} placeholder="5000" keyboardType="numeric" />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
}> = ({ label, value, onChange, placeholder, keyboardType, maxLength }) => (
  <View>
    <Text style={modalStyles.label}>{label}</Text>
    <TextInput
      style={modalStyles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xl },
  section: { marginBottom: spacing.xl },
  sectionHeader: { marginBottom: spacing.sm, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, letterSpacing: 0.3 },
  sectionSub: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  sectionCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.md, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  rowSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.borderLight, marginLeft: 36 + spacing.md * 2 },
  apiRow: { padding: spacing.md, gap: 8 },
  apiLabel: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  apiInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, height: 44, gap: 8, borderWidth: 1, borderColor: colors.borderLight },
  apiInput: { flex: 1, fontSize: 13, color: colors.textPrimary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', outlineWidth: 0 as any, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  eyeBtn: { padding: 4 },
  apiHint: { fontSize: 11, color: colors.accent, fontWeight: '600', marginTop: 4 },
  emptyInline: { fontSize: 13, color: colors.textTertiary, padding: spacing.md, textAlign: 'center' },
});

const modalStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight, backgroundColor: colors.surfaceElevated },
  cancel: { fontSize: 15, color: colors.textSecondary, fontWeight: '500' },
  save: { fontSize: 15, color: colors.accent, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: colors.surfaceElevated, borderRadius: radius.md, padding: 14, fontSize: 15, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderLight, outlineWidth: 0 as any, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.borderLight },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: '#fff' },
  colorSwatch: { width: 36, height: 36, borderRadius: 18 },
  colorSelected: { borderWidth: 3, borderColor: colors.primary },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 14, borderRadius: radius.md, backgroundColor: colors.errorBg, marginTop: spacing.lg },
  deleteText: { fontSize: 14, fontWeight: '700', color: colors.error },
});

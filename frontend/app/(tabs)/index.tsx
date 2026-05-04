import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/ThemeProvider';
import { TransactionItem } from '../../src/components/TransactionItem';
import { CategoryDonut } from '../../src/components/CategoryDonut';
import { CashFlowCard } from '../../src/components/CashFlowCard';
import { spacing, radius, typography } from '../../src/theme/design';
import { formatCompact, todayISO } from '../../src/utils/formatters';
import { TEST_MESSAGES } from '../../src/utils/upiParser';
import { getDateRange, isInRange, RANGE_OPTIONS } from '../../src/utils/dateRange';
import { DateRangeKey, AccountType } from '../../src/types';
import { getAccountIcon, BANK_COLORS } from '../../src/utils/accounts';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, accounts, settings, simulateTransaction, seedDemoData, addAccount, updateSettings, openManualEntry } = useApp();
  const { colors, isDark } = useTheme();
  const [rangeKey, setRangeKey] = useState<DateRangeKey>('month');
  const [showRangePicker, setShowRangePicker] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showDemoRow, setShowDemoRow] = useState(true);

  const range = useMemo(() => getDateRange(rangeKey), [rangeKey]);
  const filtered = useMemo(() => transactions.filter((t) => isInRange(t, range)), [transactions, range]);

  const totals = useMemo(() => {
    let income = 0, expense = 0;
    filtered.forEach((t) => { if (t.isCredit) income += t.amount; else expense += t.amount; });
    return { income, expense, net: income - expense };
  }, [filtered]);

  const accountBalances = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((a) => (map[a.id] = a.balance || 0));
    transactions.forEach((t) => {
      if (!t.accountId) return;
      if (t.isCredit) map[t.accountId] = (map[t.accountId] || 0) + t.amount;
      else map[t.accountId] = (map[t.accountId] || 0) - t.amount;
    });
    return map;
  }, [accounts, transactions]);

  const totalBalance = useMemo(
    () => Object.values(accountBalances).reduce((s, v) => s + v, 0),
    [accountBalances]
  );

  const recent = filtered.slice(0, 5);
  const hidden = settings.hideBalances;
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const maskAmount = (v: string) => (hidden ? '\u2022\u2022\u2022\u2022\u2022' : v);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.hello}>Private Ledger</Text>
              <Text style={styles.subtitle}>{range.label}</Text>
            </View>
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => updateSettings({ hideBalances: !hidden })}
              activeOpacity={0.7}
            >
              <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Total Balance with gradient */}
          <View style={styles.balanceWrap}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <View style={styles.balanceInner}>
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
              <Text style={styles.balanceValue} numberOfLines={1}>
                {hidden ? '\u2022\u2022\u2022\u2022\u2022\u2022' : '\u20b9' + formatCompact(totalBalance)}
              </Text>
              <View style={styles.balanceRow}>
                <View style={styles.balanceStat}>
                  <View style={[styles.statDot, { backgroundColor: 'rgba(255,255,255,0.85)' }]} />
                  <Text style={styles.statLabel}>Income</Text>
                  <Text style={styles.statValue}>{maskAmount('\u20b9' + formatCompact(totals.income))}</Text>
                </View>
                <View style={styles.balanceDivider} />
                <View style={styles.balanceStat}>
                  <View style={[styles.statDot, { backgroundColor: 'rgba(255,255,255,0.85)' }]} />
                  <Text style={styles.statLabel}>Expense</Text>
                  <Text style={styles.statValue}>{maskAmount('\u20b9' + formatCompact(totals.expense))}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Date range chips */}
          <View style={styles.rangeRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingRight: spacing.lg }}>
              {RANGE_OPTIONS.map((k) => {
                const sel = rangeKey === k;
                const lbl = getDateRange(k).label;
                return (
                  <TouchableOpacity key={k} style={[styles.rangeChip, sel && styles.rangeChipActive]} onPress={() => setRangeKey(k)}>
                    <Text style={[styles.rangeText, sel && styles.rangeTextActive]}>{lbl}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Accounts */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Accounts</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountsRow}>
            {accounts.map((acc) => (
              <View key={acc.id} style={[styles.accountCard, { backgroundColor: acc.color }]}>
                <View style={styles.accTop}>
                  <View style={styles.accIconWrap}>
                    <Ionicons name={(acc.icon || getAccountIcon(acc.type)) as any} size={18} color="#fff" />
                  </View>
                  <Text style={styles.accType}>{acc.type.toUpperCase()}</Text>
                </View>
                <Text style={styles.accName} numberOfLines={1}>{acc.name}</Text>
                <Text style={styles.accBalLabel}>BALANCE</Text>
                <Text style={styles.accBal} numberOfLines={1}>
                  {hidden ? '\u2022\u2022\u2022\u2022' : '\u20b9' + formatCompact(accountBalances[acc.id] || 0)}
                </Text>
                {acc.last4 ? <Text style={styles.accLast4}>{'\u2022\u2022\u2022\u2022 ' + acc.last4}</Text> : null}
              </View>
            ))}
            <TouchableOpacity style={styles.addAccountCard} onPress={() => setShowAddAccount(true)} activeOpacity={0.75}>
              <View style={styles.addAccountIcon}>
                <Ionicons name="add" size={28} color={colors.textSecondary} />
              </View>
              <Text style={styles.addAccountText}>Add account</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Cash Flow */}
          <View style={{ marginTop: spacing.xl }}>
            <CashFlowCard transactions={filtered} hide={hidden} title={range.label} />
          </View>

          {/* Donut */}
          <View style={{ marginTop: spacing.xl }}>
            <CategoryDonut transactions={filtered} hide={hidden} />
          </View>

          {/* Recent */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/transactions')}>
              <Text style={styles.linkText}>See all</Text>
            </TouchableOpacity>
          </View>
          {recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySubtitle}>Your UPI payments will appear here automatically</Text>
              <TouchableOpacity style={styles.demoBtn} onPress={seedDemoData} activeOpacity={0.85}>
                <Text style={styles.demoBtnText}>Load demo data</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.listCard}>
              {recent.map((t, i) => (
                <View key={t.id}>
                  <TransactionItem transaction={t} hideAmount={hidden} />
                  {i < recent.length - 1 && <View style={styles.listDivider} />}
                </View>
              ))}
            </View>
          )}

          {/* Test popup chips */}
          {showDemoRow && (
            <View style={styles.demoSection}>
              <View style={styles.demoHeader}>
                <Ionicons name="flash" size={14} color={colors.warning} />
                <Text style={[styles.demoLabel, { color: colors.warning }]}>Test the popup</Text>
                <TouchableOpacity onPress={() => setShowDemoRow(false)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="close" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demoScroll}>
                {[
                  { label: 'Zomato', idx: 0 }, { label: 'Amazon', idx: 1 },
                  { label: 'Transfer', idx: 2 }, { label: 'Salary', idx: 3 },
                  { label: 'BESCOM', idx: 4 }, { label: 'Starbucks', idx: 5 },
                ].map((b) => (
                  <TouchableOpacity key={b.idx} style={styles.demoChip} onPress={() => simulateTransaction(TEST_MESSAGES[b.idx])} activeOpacity={0.75}>
                    <Text style={styles.demoChipText}>{b.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <AddAccountSheet
        visible={showAddAccount}
        onClose={() => setShowAddAccount(false)}
        onSave={(data) => { addAccount(data); setShowAddAccount(false); }}
      />

      {/* Floating Add Transaction button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.accent }]} onPress={() => openManualEntry(true)} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// Inline add-account sheet
const ACCOUNT_COLORS = ['#0A84FF', '#FF3B30', '#34C759', '#FF9500', '#AF52DE', '#5E5CE6', '#FF375F', '#30B0C7', '#004C8F', '#1E40AF', '#F58220', '#97144D'];
const ACCOUNT_TYPES: AccountType[] = ['bank', 'card', 'cash', 'wallet'];

const AddAccountSheet: React.FC<{ visible: boolean; onClose: () => void; onSave: (d: any) => void }> = ({ visible, onClose, onSave }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [color, setColor] = useState(ACCOUNT_COLORS[0]);
  const [balance, setBalance] = useState('');
  const [last4, setLast4] = useState('');
  const insets = useSafeAreaInsets();
  const sheetStyles = useMemo(() => makeSheetStyles(colors), [colors]);

  React.useEffect(() => {
    if (visible) { setName(''); setBank(''); setType('bank'); setColor(ACCOUNT_COLORS[0]); setBalance(''); setLast4(''); }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      bank: bank.trim() || undefined,
      type, color,
      balance: parseFloat(balance) || 0,
      last4: last4.trim() || undefined,
      icon: getAccountIcon(type),
      senderIds: bank ? [bank.toUpperCase()] : [],
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sheetStyles.overlay}>
        <View style={[sheetStyles.sheet, { paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xl) }]}>
          <View style={sheetStyles.handle} />
          <View style={sheetStyles.headerRow}>
            <TouchableOpacity onPress={onClose}><Text style={sheetStyles.cancel}>Cancel</Text></TouchableOpacity>
            <Text style={sheetStyles.title}>New Account</Text>
            <TouchableOpacity onPress={handleSave}><Text style={sheetStyles.save}>Save</Text></TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.lg }}>
            <SheetField label="Name" value={name} onChange={setName} placeholder="e.g. HDFC Savings" />
            <SheetField label="Bank/Issuer" value={bank} onChange={setBank} placeholder="HDFC, SBI, ICICI…" />
            <View>
              <Text style={sheetStyles.label}>Type</Text>
              <View style={sheetStyles.row}>
                {ACCOUNT_TYPES.map((t) => (
                  <TouchableOpacity key={t} onPress={() => setType(t)} style={[sheetStyles.chip, type === t && sheetStyles.chipActive]}>
                    <Text style={[sheetStyles.chipText, type === t && sheetStyles.chipTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View>
              <Text style={sheetStyles.label}>Color</Text>
              <View style={sheetStyles.row}>
                {ACCOUNT_COLORS.map((c) => (
                  <TouchableOpacity key={c} onPress={() => setColor(c)} style={[sheetStyles.swatch, { backgroundColor: c }, color === c && sheetStyles.swatchActive]} />
                ))}
              </View>
            </View>
            <SheetField label="Last 4 digits" value={last4} onChange={setLast4} placeholder="1234" keyboardType="number-pad" />
            <SheetField label="Initial balance" value={balance} onChange={setBalance} placeholder="0" keyboardType="numeric" />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

import { TextInput as _RNTextInput } from 'react-native';
const SheetField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; keyboardType?: any }> = ({ label, value, onChange, placeholder, keyboardType }) => {
  const { colors } = useTheme();
  return (
    <View>
      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        style={{
          backgroundColor: colors.surfaceSecondary,
          borderRadius: radius.md,
          padding: 12,
          fontSize: 15,
          color: colors.textPrimary,
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}),
        }}
      />
    </View>
  );
};

const makeStyles = (c: any) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  hello: { ...typography.title, color: c.textPrimary },
  subtitle: { ...typography.small, color: c.textSecondary, marginTop: 2 },
  eyeBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderLight },
  balanceWrap: { borderRadius: radius.xxl, overflow: 'hidden', marginBottom: spacing.lg, ...Platform.select({ ios: { shadowColor: c.gradientStart, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 24 }, android: { elevation: 6 } }) },
  balanceInner: { padding: spacing.xl },
  balanceLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  balanceValue: { color: '#fff', fontSize: 38, fontWeight: '700', letterSpacing: -1, marginTop: 4, marginBottom: spacing.lg },
  balanceRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.18)' },
  balanceStat: { flex: 1 },
  balanceDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.18)', marginHorizontal: spacing.md },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  rangeRow: { marginBottom: spacing.lg },
  rangeChip: { paddingHorizontal: 14, paddingVertical: 7, backgroundColor: c.surface, borderRadius: radius.full, borderWidth: 1, borderColor: c.borderLight },
  rangeChipActive: { backgroundColor: c.primary, borderColor: c.primary },
  rangeText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  rangeTextActive: { color: c.background === '#000000' ? '#000' : '#fff' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { ...typography.subtitle, color: c.textPrimary },
  linkText: { fontSize: 13, fontWeight: '600', color: c.accent },
  accountsRow: { paddingRight: spacing.lg },
  accountCard: { width: 180, borderRadius: radius.lg, padding: spacing.lg, marginRight: spacing.md, minHeight: 140, justifyContent: 'space-between' },
  accTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  accIconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  accType: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  accName: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: spacing.md },
  accBalLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: spacing.sm },
  accBal: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 },
  accLast4: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '600', marginTop: 4, letterSpacing: 1 },
  addAccountCard: { width: 140, borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1, borderStyle: 'dashed', borderColor: c.border, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
  addAccountIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceSecondary, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  addAccountText: { fontSize: 12, color: c.textSecondary, fontWeight: '600' },
  listCard: { backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight },
  listDivider: { height: 1, backgroundColor: c.borderLight, marginLeft: 4 + spacing.md + 44 + spacing.md },
  emptyCard: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: c.borderLight, gap: 6 },
  emptyTitle: { ...typography.bodySemibold, color: c.textPrimary, marginTop: 8 },
  emptySubtitle: { ...typography.small, color: c.textSecondary, textAlign: 'center', marginTop: 2 },
  demoBtn: { marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.full, backgroundColor: c.primary },
  demoBtnText: { color: c.background === '#000000' ? '#000' : '#fff', fontSize: 13, fontWeight: '600' },
  demoSection: { marginTop: spacing.xl, backgroundColor: c.warningBg, borderRadius: radius.lg, padding: spacing.md },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  demoLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  demoScroll: { gap: 8 },
  demoChip: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: c.surface, borderRadius: radius.full, marginRight: 6 },
  demoChipText: { fontSize: 12, fontWeight: '600', color: c.textPrimary },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 12 }, android: { elevation: 8 } }) },
});

const makeSheetStyles = (c: any) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: c.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: spacing.sm, paddingHorizontal: spacing.xxl, maxHeight: '85%' },
  handle: { width: 40, height: 4, backgroundColor: c.border, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  cancel: { fontSize: 15, color: c.textSecondary, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: c.textPrimary },
  save: { fontSize: 15, color: c.accent, fontWeight: '700' },
  label: { fontSize: 11, fontWeight: '700', color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.full, backgroundColor: c.surfaceSecondary, borderWidth: 1, borderColor: c.borderLight },
  chipActive: { backgroundColor: c.primary, borderColor: c.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: c.textSecondary },
  chipTextActive: { color: c.background === '#000000' ? '#000' : '#fff' },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  swatchActive: { borderWidth: 3, borderColor: c.accent },
});

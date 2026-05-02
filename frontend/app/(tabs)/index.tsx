import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { TransactionItem } from '../../src/components/TransactionItem';
import { AccountCard } from '../../src/components/AccountCard';
import { CategoryDonut } from '../../src/components/CategoryDonut';
import { CashFlowCard } from '../../src/components/CashFlowCard';
import { colors, radius, spacing, typography } from '../../src/theme/design';
import { formatCompact, isCurrentMonth, todayISO } from '../../src/utils/formatters';
import { TEST_MESSAGES } from '../../src/utils/upiParser';

export default function HomeScreen() {
  const router = useRouter();
  const { transactions, accounts, settings, simulateTransaction, seedDemoData, ready } = useApp();
  const [showDemoRow, setShowDemoRow] = useState(true);

  const totals = useMemo(() => {
    let income = 0, expense = 0, today = 0;
    transactions.forEach((t) => {
      if (t.isCredit) income += t.amount;
      else expense += t.amount;
      if (t.date === todayISO() && !t.isCredit) today += t.amount;
    });
    return { income, expense, net: income - expense, today };
  }, [transactions]);

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

  const recent = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.hello}>Private Ledger</Text>
            <Text style={styles.subtitle}>Your money, at a glance</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/settings')}>
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Total Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
          <Text style={styles.balanceValue} numberOfLines={1}>{'₹' + formatCompact(totalBalance)}</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <View style={[styles.statDot, { backgroundColor: colors.success }]} />
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue}>{'₹' + formatCompact(totals.income)}</Text>
            </View>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceStat}>
              <View style={[styles.statDot, { backgroundColor: colors.error }]} />
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statValue}>{'₹' + formatCompact(totals.expense)}</Text>
            </View>
          </View>
        </View>

        {/* Accounts */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Accounts</Text>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Text style={styles.linkText}>Manage</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.accountsRow}>
          {accounts.map((acc) => (
            <AccountCard key={acc.id} account={acc} balance={accountBalances[acc.id] || 0} />
          ))}
          <TouchableOpacity style={styles.addAccountCard} onPress={() => router.push('/settings')} activeOpacity={0.7}>
            <View style={styles.addAccountIcon}>
              <Ionicons name="add" size={24} color={colors.textSecondary} />
            </View>
            <Text style={styles.addAccountText}>Add account</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Cash Flow */}
        <View style={{ marginTop: spacing.xl }}>
          <CashFlowCard transactions={transactions} />
        </View>

        {/* Category Donut */}
        <View style={{ marginTop: spacing.xl }}>
          <CategoryDonut transactions={transactions.filter((t) => isCurrentMonth(t.date))} />
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
            {recent.map((t, i) => {
              const acc = accounts.find((a) => a.id === t.accountId);
              return (
                <View key={t.id}>
                  <TransactionItem transaction={t} accountName={acc?.name} />
                  {i < recent.length - 1 && <View style={styles.listDivider} />}
                </View>
              );
            })}
          </View>
        )}

        {/* Test Banner Demo (collapsible) */}
        {showDemoRow && (
          <View style={styles.demoSection}>
            <View style={styles.demoHeader}>
              <Ionicons name="flash" size={14} color={colors.warning} />
              <Text style={styles.demoLabel}>Test the popup</Text>
              <TouchableOpacity onPress={() => setShowDemoRow(false)} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demoScroll}>
              {[
                { label: 'Zomato', idx: 0 },
                { label: 'Amazon', idx: 1 },
                { label: 'Transfer', idx: 2 },
                { label: 'Salary', idx: 3 },
                { label: 'BESCOM', idx: 4 },
                { label: 'Starbucks', idx: 5 },
              ].map((b) => (
                <TouchableOpacity
                  key={b.idx}
                  style={styles.demoChip}
                  onPress={() => simulateTransaction(TEST_MESSAGES[b.idx])}
                  activeOpacity={0.75}
                >
                  <Text style={styles.demoChipText}>{b.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  hello: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  bellBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.borderLight },
  balanceCard: { backgroundColor: colors.primary, borderRadius: radius.xxl, padding: spacing.xl, marginBottom: spacing.xl },
  balanceLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  balanceValue: { color: '#fff', fontSize: 38, fontWeight: '700', letterSpacing: -1, marginTop: 4, marginBottom: spacing.lg },
  balanceRow: { flexDirection: 'row', alignItems: 'center', paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.12)' },
  balanceStat: { flex: 1 },
  balanceDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: spacing.md },
  statDot: { width: 6, height: 6, borderRadius: 3, marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '600' },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitle: { ...typography.subtitle, color: colors.textPrimary },
  linkText: { fontSize: 13, fontWeight: '600', color: colors.accent },
  accountsRow: { paddingRight: spacing.lg },
  addAccountCard: { width: 140, borderRadius: radius.lg, backgroundColor: colors.surfaceElevated, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, alignItems: 'center', justifyContent: 'center', minHeight: 140 },
  addAccountIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  addAccountText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
  listCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight },
  listDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.lg + 44 + spacing.md },
  emptyCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.borderLight, gap: 6 },
  emptyTitle: { ...typography.bodySemibold, color: colors.textPrimary, marginTop: 8 },
  emptySubtitle: { ...typography.small, color: colors.textSecondary, textAlign: 'center', marginTop: 2 },
  demoBtn: { marginTop: spacing.md, paddingVertical: 10, paddingHorizontal: 20, borderRadius: radius.full, backgroundColor: colors.primary },
  demoBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  demoSection: { marginTop: spacing.xl, backgroundColor: colors.warningBg, borderRadius: radius.lg, padding: spacing.md },
  demoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  demoLabel: { fontSize: 11, fontWeight: '700', color: colors.warning, letterSpacing: 0.4, textTransform: 'uppercase' },
  demoScroll: { gap: 8 },
  demoChip: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: radius.full, marginRight: 6 },
  demoChipText: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
});

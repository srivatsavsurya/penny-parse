import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { TransactionBanner } from '../src/components/TransactionBanner';
import { TEST_MESSAGES } from '../src/utils/upiParser';
import { colors, typography, spacing, radius } from '../src/theme/design';
import { getCategoryInfo } from '../src/utils/categories';

export default function HomeScreen() {
  const {
    transactions,
    pendingTransaction,
    confirmTransaction,
    dismissTransaction,
    simulateTransaction,
    clearData,
  } = useApp();

  const handleTestSMS = (index: number) => {
    simulateTransaction(TEST_MESSAGES[index]);
  };

  const recentTransactions = transactions.slice(0, 10);
  const totalSpent = transactions
    .filter(t => !t.isCredit)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Private Ledger</Text>
          <Text style={styles.subtitle}>UPI expense tracker</Text>
        </View>

        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="shield-checkmark" size={24} color={colors.success} />
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>Background Service</Text>
            <Text style={styles.statusText}>
              {Platform.OS === 'android' 
                ? 'Listening for UPI transactions'
                : 'SMS detection requires Android'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>₹{totalSpent.toLocaleString('en-IN')}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Test SMS Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test SMS Detection</Text>
          <Text style={styles.sectionDesc}>
            Tap to simulate receiving a UPI payment notification
          </Text>
          
          <View style={styles.testGrid}>
            {[
              { label: 'Zomato ₹458', index: 0, icon: 'restaurant' },
              { label: 'Amazon ₹1,250', index: 1, icon: 'bag' },
              { label: 'Transfer ₹320', index: 2, icon: 'swap-horizontal' },
              { label: 'Salary +₹85K', index: 3, icon: 'cash' },
              { label: 'BESCOM ₹2,140', index: 4, icon: 'flash' },
              { label: 'Starbucks ₹740', index: 5, icon: 'cafe' },
            ].map((item) => (
              <TouchableOpacity
                key={item.index}
                style={styles.testBtn}
                onPress={() => handleTestSMS(item.index)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={20} color={colors.textSecondary} />
                <Text style={styles.testBtnText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent</Text>
              <TouchableOpacity onPress={clearData}>
                <Text style={styles.clearBtn}>Clear All</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.transactionList}>
              {recentTransactions.map((tx) => {
                const cat = getCategoryInfo(tx.category);
                return (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={[styles.txIcon, { backgroundColor: cat.color + '15' }]}>
                      <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                    </View>
                    <View style={styles.txContent}>
                      <Text style={styles.txMerchant}>{tx.merchant}</Text>
                      <Text style={styles.txMeta}>{tx.time} · {cat.name}</Text>
                    </View>
                    <Text style={[styles.txAmount, tx.isCredit && styles.txCredit]}>
                      {tx.isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textTertiary} />
          <Text style={styles.infoText}>
            On Android, the app runs in background and shows a popup when UPI payment SMS is detected.
            All data stays on your device.
          </Text>
        </View>
      </ScrollView>

      {/* Transaction Banner Popup */}
      {pendingTransaction && (
        <TransactionBanner
          visible={!!pendingTransaction}
          amount={pendingTransaction.amount}
          merchant={pendingTransaction.merchant}
          isDebit={pendingTransaction.isDebit}
          time={pendingTransaction.time}
          onConfirm={confirmTransaction}
          onDismiss={dismissTransaction}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.title,
    fontSize: 28,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusContent: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  statusTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  statusText: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  statValue: {
    ...typography.title,
    color: colors.textPrimary,
  },
  statLabel: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  sectionDesc: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  clearBtn: {
    ...typography.small,
    color: colors.error,
  },
  testGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    gap: spacing.sm,
  },
  testBtnText: {
    ...typography.small,
    color: colors.textSecondary,
  },
  transactionList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  txMerchant: {
    ...typography.body,
    color: colors.textPrimary,
  },
  txMeta: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txAmount: {
    ...typography.bodyMedium,
    color: colors.textPrimary,
  },
  txCredit: {
    color: colors.success,
  },
  infoSection: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
    ...typography.small,
    color: colors.textTertiary,
    lineHeight: 20,
  },
});

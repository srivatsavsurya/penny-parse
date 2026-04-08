import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../../src/context/TransactionContext';
import { TransactionCard, CategoryBreakdown, PrivacyScore, AddTransactionModal } from '../../src/components';
import { formatAmount, getMonthYear } from '../../src/utils/formatters';

export default function VaultScreen() {
  const {
    transactions,
    isLoading,
    getTotalSpend,
    getSpendByCategory,
    getRecentTransactions,
    loadDemoData,
  } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const totalSpend = getTotalSpend();
  const categorySpend = getSpendByCategory();
  const recentTransactions = getRecentTransactions(3);

  // Calculate vault balance (mock: total credits - total debits for the month)
  const totalCredits = transactions
    .filter(t => t.isCredit)
    .reduce((sum, t) => sum + t.amount, 0);
  const vaultBalance = totalCredits - totalSpend;

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="shield-checkmark" size={18} color="#0D5D56" />
          </View>
          <Text style={styles.logoText}>The Private Ledger</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={28} color="#0D5D56" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0D5D56" />
        }
      >
        {/* Security Badges */}
        <View style={styles.badgeRow}>
          <View style={styles.badge}>
            <Ionicons name="lock-closed" size={12} color="#0D5D56" />
            <Text style={styles.badgeText}>LOCAL ONLY</Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="key" size={12} color="#0D5D56" />
            <Text style={styles.badgeText}>ENCRYPTED</Text>
          </View>
        </View>

        {/* Total Monthly Spend */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL MONTHLY SPEND</Text>
          <Text style={styles.totalAmount}>₹{formatAmount(totalSpend)}</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add Entry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.uploadButton}>
              <Ionicons name="cloud-upload-outline" size={20} color="#0D5D56" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent UPI Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent UPI Transactions</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="arrow-forward" size={14} color="#0D5D56" />
            </TouchableOpacity>
          </View>
          
          {recentTransactions.map(transaction => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>

        {/* Vault Balance */}
        <View style={styles.vaultBalanceCard}>
          <View style={styles.vaultIcon}>
            <Ionicons name="business-outline" size={24} color="#0D5D56" />
          </View>
          <View style={styles.vaultInfo}>
            <Text style={styles.vaultTitle}>Vault Balance</Text>
            <Text style={styles.vaultSubtitle}>Available for spending this month.</Text>
          </View>
          <Text style={styles.vaultAmount}>₹{formatAmount(Math.max(0, vaultBalance))}</Text>
        </View>

        {/* Privacy Score */}
        <PrivacyScore score={98} />

        {/* Category Breakdown */}
        <View style={styles.section}>
          <CategoryBreakdown data={categorySpend} totalSpend={totalSpend} />
        </View>

        {/* Monthly Insight */}
        <View style={styles.insightCard}>
          <View style={styles.insightIcon}>
            <Ionicons name="trending-down" size={20} color="#10B981" />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>Monthly Insight</Text>
            <Text style={styles.insightText}>
              You&apos;ve spent 12% less on Travel compared to last month. Great job!
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0D5D56',
  },
  profileButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D5D56',
    marginLeft: 6,
  },
  totalSection: {
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  totalAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D5D56',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginRight: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  uploadButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D5D56',
    marginRight: 4,
  },
  vaultBalanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vaultIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vaultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vaultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  vaultSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  vaultAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
});

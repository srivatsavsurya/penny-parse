import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { TransactionItem, AddTransactionSheet, SpendingByCategory, InsightsCard } from '../../src/components';
import { formatCurrency, getCurrentMonth } from '../../src/utils/formatters';

export default function HomeScreen() {
  const { transactions, settings, getMonthlySpend, getSpendByCategory, pendingSMS } = useApp();
  const [showAddSheet, setShowAddSheet] = useState(false);

  // Show SMS sheet when new SMS detected
  useEffect(() => {
    if (pendingSMS) {
      setShowAddSheet(true);
    }
  }, [pendingSMS]);

  const monthlySpend = getMonthlySpend();
  const categorySpend = getSpendByCategory();
  const recentTx = transactions.slice(0, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f8f8" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getCurrentMonth()}</Text>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalAmount}>{formatCurrency(monthlySpend)}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddSheet(true)}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Category Breakdown */}
        <SpendingByCategory data={categorySpend} total={monthlySpend} />

        {/* Insights */}
        {settings.enableAiInsights && (
          <InsightsCard 
            transactions={transactions} 
            apiKey={settings.openRouterApiKey} 
          />
        )}

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
          </View>
          {recentTx.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet</Text>
          ) : (
            recentTx.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Transaction Sheet */}
      <AddTransactionSheet
        visible={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        smsData={pendingSMS}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
  },
  addBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 30,
  },
});

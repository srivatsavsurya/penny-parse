import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../../src/context/TransactionContext';
import { TransactionCard } from '../../src/components';
import { formatDate, formatAmount } from '../../src/utils/formatters';
import { parseISO, isToday, isYesterday, format } from 'date-fns';

export default function ActivityScreen() {
  const { transactions } = useTransactions();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.merchant.toLowerCase().includes(query) ||
          t.amount.toString().includes(query) ||
          t.category.includes(query)
      );
    }

    // Apply time filter
    if (activeFilter === 'month') {
      const currentMonth = format(new Date(), 'yyyy-MM');
      filtered = filtered.filter(t => t.date.startsWith(currentMonth));
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateCompare = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.time.localeCompare(a.time);
    });

    // Group by date
    const groups: { [key: string]: typeof transactions } = {};
    filtered.forEach(t => {
      const dateKey = formatDate(t.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });

    return groups;
  }, [transactions, activeFilter, searchQuery]);

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
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="search-outline" size={22} color="#0D5D56" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={28} color="#0D5D56" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <Text style={styles.overviewLabel}>LEDGER OVERVIEW</Text>
          <Text style={styles.pageTitle}>Activity</Text>
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {(['all', 'month', 'merchant'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.activeFilterChip,
              ]}
              onPress={() => setActiveFilter(filter)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === filter && styles.activeFilterText,
                ]}
              >
                {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'Merchant'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by merchant, amount, or tag..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Transaction Groups */}
        {Object.entries(groupedTransactions).map(([dateKey, txns]) => (
          <View key={dateKey} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{dateKey}</Text>
            {txns.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </View>
        ))}

        {/* Archived Button */}
        <TouchableOpacity style={styles.archivedButton}>
          <Text style={styles.archivedText}>View Archived Transactions</Text>
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        </TouchableOpacity>
      </ScrollView>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 4,
    marginLeft: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 16,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFilterChip: {
    backgroundColor: '#0D5D56',
    borderColor: '#0D5D56',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    marginLeft: 12,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
  },
  archivedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  archivedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 8,
  },
});

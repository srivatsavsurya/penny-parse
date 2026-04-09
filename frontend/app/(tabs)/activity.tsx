import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { TransactionItem } from '../../src/components';
import { formatDate } from '../../src/utils/formatters';
import { format } from 'date-fns';

export default function ActivityScreen() {
  const { transactions } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'month'>('month');

  const grouped = useMemo(() => {
    let filtered = [...transactions];

    // Search
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        t.merchant.toLowerCase().includes(q) ||
        t.amount.toString().includes(q) ||
        t.category.includes(q)
      );
    }

    // Time filter
    if (filter === 'month') {
      const month = format(new Date(), 'yyyy-MM');
      filtered = filtered.filter(t => t.date.startsWith(month));
    }

    // Sort
    filtered.sort((a, b) => {
      const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
      return dateDiff !== 0 ? dateDiff : b.time.localeCompare(a.time);
    });

    // Group by date
    const groups: Record<string, typeof transactions> = {};
    filtered.forEach(t => {
      const key = formatDate(t.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    return groups;
  }, [transactions, search, filter]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'month' && styles.filterActive]}
          onPress={() => setFilter('month')}
        >
          <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
            This Month
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#999" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([date, txs]) => (
          <View key={date} style={styles.group}>
            <Text style={styles.dateHeader}>{date}</Text>
            <View style={styles.txList}>
              {txs.map(tx => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
            </View>
          </View>
        ))}

        {Object.keys(grouped).length === 0 && (
          <Text style={styles.emptyText}>No transactions found</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: '#1a1a1a',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 15,
    color: '#1a1a1a',
  },
  scroll: {
    flex: 1,
  },
  group: {
    marginBottom: 8,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  txList: {
    backgroundColor: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    padding: 40,
  },
});

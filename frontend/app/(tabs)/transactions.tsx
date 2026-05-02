import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SectionList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../../src/context/AppContext';
import { TransactionItem } from '../../src/components/TransactionItem';
import { colors, radius, spacing, typography } from '../../src/theme/design';
import { formatDate, formatCompact, todayISO } from '../../src/utils/formatters';
import { CATEGORIES, EXPENSE_CATEGORIES, getCategoryInfo } from '../../src/utils/categories';
import { CategoryType, Transaction } from '../../src/types';

type FilterType = 'all' | 'expense' | 'income';
type ViewMode = 'list' | 'calendar';

export default function TransactionsScreen() {
  const { transactions, accounts } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (query && !t.merchant.toLowerCase().includes(query.toLowerCase())) return false;
      if (filterType === 'expense' && t.isCredit) return false;
      if (filterType === 'income' && !t.isCredit) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, query, filterType, filterCategory]);

  const sections = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach((t) => {
      if (!map[t.date]) map[t.date] = [];
      map[t.date].push(t);
    });
    return Object.entries(map)
      .sort((a, b) => (a[0] < b[0] ? 1 : -1))
      .map(([date, data]) => ({ title: date, data }));
  }, [filtered]);

  // Calendar marked dates with dots per amount
  const markedDates = useMemo(() => {
    const result: any = {};
    const dayTotals: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      if (!dayTotals[t.date]) dayTotals[t.date] = { income: 0, expense: 0 };
      if (t.isCredit) dayTotals[t.date].income += t.amount;
      else dayTotals[t.date].expense += t.amount;
    });
    Object.entries(dayTotals).forEach(([date, { income, expense }]) => {
      const dots: any[] = [];
      if (expense > 0) dots.push({ color: colors.error });
      if (income > 0) dots.push({ color: colors.success });
      result[date] = { dots, marked: true };
    });
    result[selectedDate] = { ...(result[selectedDate] || {}), selected: true, selectedColor: colors.primary };
    return result;
  }, [transactions, selectedDate]);

  const selectedDayTx = useMemo(
    () => filtered.filter((t) => t.date === selectedDate),
    [filtered, selectedDate]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.modeToggle}>
          {(['list', 'calendar'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.modeBtn, viewMode === m && styles.modeActive]}
              onPress={() => setViewMode(m)}
            >
              <Ionicons
                name={m === 'list' ? 'list' : 'calendar'}
                size={16}
                color={viewMode === m ? '#fff' : colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search merchant…"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
          />
          {query ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {(['all', 'expense', 'income'] as FilterType[]).map((ft) => (
          <TouchableOpacity
            key={ft}
            style={[styles.filterChip, filterType === ft && styles.filterActive]}
            onPress={() => setFilterType(ft)}
          >
            <Text style={[styles.filterText, filterType === ft && styles.filterTextActive]}>
              {ft === 'all' ? 'All' : ft === 'expense' ? 'Expenses' : 'Income'}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.filterDivider} />
        <TouchableOpacity
          style={[styles.filterChip, filterCategory === 'all' && styles.filterActive]}
          onPress={() => setFilterCategory('all')}
        >
          <Text style={[styles.filterText, filterCategory === 'all' && styles.filterTextActive]}>All categories</Text>
        </TouchableOpacity>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.filterChip, filterCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}
            onPress={() => setFilterCategory(cat.id)}
          >
            <Ionicons
              name={cat.icon as any}
              size={13}
              color={filterCategory === cat.id ? '#fff' : cat.color}
            />
            <Text
              style={[
                styles.filterText,
                { marginLeft: 5 },
                filterCategory === cat.id && styles.filterTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {viewMode === 'calendar' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg }}>
          <View style={styles.calendarCard}>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(d) => setSelectedDate(d.dateString)}
              theme={{
                backgroundColor: colors.surfaceElevated,
                calendarBackground: colors.surfaceElevated,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: colors.accent,
                dayTextColor: colors.textPrimary,
                textDisabledColor: colors.textTertiary,
                arrowColor: colors.textPrimary,
                monthTextColor: colors.textPrimary,
                textMonthFontWeight: '700',
                textDayFontWeight: '500',
              }}
            />
          </View>
          <View style={styles.selectedDayHeader}>
            <Text style={styles.selectedDayTitle}>{formatDate(selectedDate)}</Text>
            <Text style={styles.selectedDaySub}>{selectedDayTx.length + ' transactions'}</Text>
          </View>
          {selectedDayTx.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={28} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No transactions on this day</Text>
            </View>
          ) : (
            <View style={styles.listCard}>
              {selectedDayTx.map((t, i) => {
                const acc = accounts.find((a) => a.id === t.accountId);
                return (
                  <View key={t.id}>
                    <TransactionItem transaction={t} accountName={acc?.name} />
                    {i < selectedDayTx.length - 1 && <View style={styles.listDivider} />}
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            const dayTxs = section.data;
            const inc = dayTxs.filter((t) => t.isCredit).reduce((s, t) => s + t.amount, 0);
            const exp = dayTxs.filter((t) => !t.isCredit).reduce((s, t) => s + t.amount, 0);
            return (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{formatDate(section.title)}</Text>
                <Text style={styles.sectionMeta}>
                  {(inc > 0 ? '+₹' + formatCompact(inc) + '  ' : '') + (exp > 0 ? '−₹' + formatCompact(exp) : '')}
                </Text>
              </View>
            );
          }}
          renderItem={({ item, index, section }) => {
            const acc = accounts.find((a) => a.id === item.accountId);
            return (
              <View style={styles.itemWrap}>
                <TransactionItem transaction={item} accountName={acc?.name} />
                {index < section.data.length - 1 && <View style={styles.listDivider} />}
              </View>
            );
          }}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
              <Text style={styles.emptyText}>No transactions match your filters</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.title, color: colors.textPrimary },
  modeToggle: { flexDirection: 'row', backgroundColor: colors.surfaceElevated, borderRadius: radius.full, padding: 3, borderWidth: 1, borderColor: colors.borderLight },
  modeBtn: { width: 36, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  modeActive: { backgroundColor: colors.primary },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: colors.borderLight, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary, outlineWidth: 0 as any, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },
  filtersRow: { paddingHorizontal: spacing.lg, gap: 6, paddingBottom: spacing.md, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.surfaceElevated, borderRadius: radius.full, borderWidth: 1, borderColor: colors.borderLight, marginRight: 6 },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: '#fff' },
  filterDivider: { width: 1, height: 20, backgroundColor: colors.border, marginHorizontal: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  sectionMeta: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  itemWrap: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 0 },
  listCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderLight, marginTop: spacing.md },
  listDivider: { height: 1, backgroundColor: colors.borderLight, marginLeft: spacing.lg + 44 + spacing.md },
  empty: { alignItems: 'center', padding: spacing.xxxl, gap: 8 },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  calendarCard: { backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1, borderColor: colors.borderLight },
  selectedDayHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  selectedDayTitle: { ...typography.subtitle, color: colors.textPrimary },
  selectedDaySub: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
});

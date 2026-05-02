import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SectionList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useApp } from '../../src/context/AppContext';
import { useTheme } from '../../src/theme/ThemeProvider';
import { TransactionItem } from '../../src/components/TransactionItem';
import { spacing, radius, typography } from '../../src/theme/design';
import { formatDate, formatCompact, todayISO } from '../../src/utils/formatters';
import { getAllCategories } from '../../src/utils/categories';
import { CategoryType, Transaction } from '../../src/types';

type FilterType = 'all' | 'expense' | 'income';
type ViewMode = 'list' | 'calendar';

export default function TransactionsScreen() {
  const { transactions, customCategories, settings } = useApp();
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [filterCategory, setFilterCategory] = useState<CategoryType | 'all'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO());
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const allCats = useMemo(() => getAllCategories(customCategories), [customCategories]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (query && !t.merchant.toLowerCase().includes(query.toLowerCase()) && !(t.notes || '').toLowerCase().includes(query.toLowerCase())) return false;
      if (filterType === 'expense' && t.isCredit) return false;
      if (filterType === 'income' && !t.isCredit) return false;
      if (filterCategory !== 'all' && t.category !== filterCategory) return false;
      return true;
    });
  }, [transactions, query, filterType, filterCategory]);

  const sections = useMemo(() => {
    const map: Record<string, Transaction[]> = {};
    filtered.forEach((t) => { if (!map[t.date]) map[t.date] = []; map[t.date].push(t); });
    return Object.entries(map).sort((a, b) => (a[0] < b[0] ? 1 : -1)).map(([date, data]) => ({ title: date, data }));
  }, [filtered]);

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
    result[selectedDate] = { ...(result[selectedDate] || {}), selected: true, selectedColor: colors.accent };
    return result;
  }, [transactions, selectedDate, colors]);

  const selectedDayTx = useMemo(() => filtered.filter((t) => t.date === selectedDate), [filtered, selectedDate]);
  const dayTotals = useMemo(() => {
    let inc = 0, exp = 0;
    selectedDayTx.forEach((t) => { if (t.isCredit) inc += t.amount; else exp += t.amount; });
    return { inc, exp };
  }, [selectedDayTx]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <View style={styles.modeToggle}>
          {(['list', 'calendar'] as const).map((m) => (
            <TouchableOpacity key={m} style={[styles.modeBtn, viewMode === m && { backgroundColor: colors.accent }]} onPress={() => setViewMode(m)}>
              <Ionicons name={m === 'list' ? 'list' : 'calendar'} size={16} color={viewMode === m ? '#fff' : colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput style={styles.searchInput} placeholder="Search merchant or note…" placeholderTextColor={colors.textTertiary} value={query} onChangeText={setQuery} />
          {query ? <TouchableOpacity onPress={() => setQuery('')}><Ionicons name="close-circle" size={18} color={colors.textTertiary} /></TouchableOpacity> : null}
        </View>
      </View>

      {viewMode === 'list' && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
          {(['all', 'expense', 'income'] as FilterType[]).map((ft) => (
            <TouchableOpacity key={ft} style={[styles.filterChip, filterType === ft && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setFilterType(ft)}>
              <Text style={[styles.filterText, filterType === ft && { color: colors.background === '#000000' ? '#000' : '#fff' }]}>{ft === 'all' ? 'All' : ft === 'expense' ? 'Expenses' : 'Income'}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.filterDivider} />
          <TouchableOpacity style={[styles.filterChip, filterCategory === 'all' && { backgroundColor: colors.primary, borderColor: colors.primary }]} onPress={() => setFilterCategory('all')}>
            <Text style={[styles.filterText, filterCategory === 'all' && { color: colors.background === '#000000' ? '#000' : '#fff' }]}>All categories</Text>
          </TouchableOpacity>
          {allCats.map((cat) => (
            <TouchableOpacity key={cat.id} style={[styles.filterChip, filterCategory === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]} onPress={() => setFilterCategory(cat.id)}>
              <Ionicons name={cat.icon as any} size={13} color={filterCategory === cat.id ? '#fff' : cat.color} />
              <Text style={[styles.filterText, { marginLeft: 5 }, filterCategory === cat.id && { color: '#fff' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {viewMode === 'calendar' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}>
          <View style={styles.calendarCard}>
            <Calendar
              markingType="multi-dot"
              markedDates={markedDates}
              onDayPress={(d) => setSelectedDate(d.dateString)}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.accent,
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
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.dayTitle}>{formatDate(selectedDate)}</Text>
              <Text style={styles.daySub}>{selectedDayTx.length + ' transaction' + (selectedDayTx.length !== 1 ? 's' : '')}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {dayTotals.inc > 0 ? <Text style={[styles.dayAmt, { color: colors.success }]}>{'+\u20b9' + formatCompact(dayTotals.inc)}</Text> : null}
              {dayTotals.exp > 0 ? <Text style={[styles.dayAmt, { color: colors.error }]}>{'\u2212\u20b9' + formatCompact(dayTotals.exp)}</Text> : null}
            </View>
          </View>
          {selectedDayTx.length === 0 ? (
            <View style={styles.empty}><Ionicons name="calendar-outline" size={28} color={colors.textTertiary} /><Text style={styles.emptyText}>No transactions on this day</Text></View>
          ) : (
            <View style={styles.listCard}>
              {selectedDayTx.map((t, i) => (
                <View key={t.id}>
                  <TransactionItem transaction={t} hideAmount={settings.hideBalances} />
                  {i < selectedDayTx.length - 1 && <View style={styles.listDivider} />}
                </View>
              ))}
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
                  {(inc > 0 ? '+\u20b9' + formatCompact(inc) + '  ' : '') + (exp > 0 ? '\u2212\u20b9' + formatCompact(exp) : '')}
                </Text>
              </View>
            );
          }}
          renderItem={({ item, index, section }) => (
            <View style={styles.itemWrap}>
              <TransactionItem transaction={item} hideAmount={settings.hideBalances} />
              {index < section.data.length - 1 && <View style={styles.listDivider} />}
            </View>
          )}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 80 }}
          ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={32} color={colors.textTertiary} /><Text style={styles.emptyText}>No transactions match</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (c: any) => StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md },
  title: { ...typography.title, color: c.textPrimary },
  modeToggle: { flexDirection: 'row', backgroundColor: c.surface, borderRadius: radius.full, padding: 3, borderWidth: 1, borderColor: c.borderLight },
  modeBtn: { width: 36, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, height: 44, borderWidth: 1, borderColor: c.borderLight, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, color: c.textPrimary, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any, outlineWidth: 0 as any } : {}) },
  filtersRow: { paddingHorizontal: spacing.lg, gap: 6, paddingBottom: spacing.md, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 12, backgroundColor: c.surface, borderRadius: radius.full, borderWidth: 1, borderColor: c.borderLight, marginRight: 6 },
  filterText: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
  filterDivider: { width: 1, height: 20, backgroundColor: c.border, marginHorizontal: 6 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { ...typography.bodySemibold, color: c.textPrimary },
  sectionMeta: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
  itemWrap: { backgroundColor: c.surface },
  listCard: { backgroundColor: c.surface, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: c.borderLight, marginTop: spacing.md },
  listDivider: { height: 1, backgroundColor: c.borderLight, marginLeft: 4 + spacing.md + 44 + spacing.md },
  empty: { alignItems: 'center', padding: spacing.xxxl, gap: 8 },
  emptyText: { fontSize: 13, color: c.textTertiary },
  calendarCard: { backgroundColor: c.surface, borderRadius: radius.lg, padding: spacing.sm, borderWidth: 1, borderColor: c.borderLight },
  dayHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.sm },
  dayTitle: { ...typography.subtitle, color: c.textPrimary },
  daySub: { fontSize: 12, color: c.textSecondary, fontWeight: '500', marginTop: 2 },
  dayAmt: { fontSize: 13, fontWeight: '700' },
});

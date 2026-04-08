import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '../../src/context/TransactionContext';
import { formatAmount } from '../../src/utils/formatters';
import { getCategoryInfo } from '../../src/utils/categories';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { subDays, format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AnalysisScreen() {
  const { transactions, getSpendByCategory, getTotalSpend } = useTransactions();

  // Calculate weekly expenditure
  const weeklyData = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    
    let weekTotal = 0;
    transactions.forEach(t => {
      if (!t.isCredit) {
        const txDate = parseISO(t.date);
        if (isWithinInterval(txDate, { start: weekStart, end: weekEnd })) {
          weekTotal += t.amount;
        }
      }
    });
    
    return weekTotal;
  }, [transactions]);

  // Calculate allocation data for pie chart
  const allocationData = useMemo(() => {
    const categorySpend = getSpendByCategory();
    const total = getTotalSpend();
    
    const colors = ['#0D5D56', '#8B4513', '#4ECDC4', '#FFB347', '#7C3AED', '#EA580C'];
    
    return categorySpend.slice(0, 3).map((item, index) => ({
      value: item.amount,
      color: colors[index % colors.length],
      text: `${Math.round((item.amount / total) * 100)}%`,
      label: getCategoryInfo(item.category).name,
    }));
  }, [transactions]);

  // Weekly bar chart data
  const barData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    
    return days.map((day, index) => {
      const dayDate = format(new Date(weekStart.getTime() + index * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
      const dayTotal = transactions
        .filter(t => !t.isCredit && t.date === dayDate)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        value: dayTotal / 1000, // In thousands
        label: day.toUpperCase(),
        frontColor: index === new Date().getDay() - 1 ? '#0D5D56' : '#E5E7EB',
      };
    });
  }, [transactions]);

  const topCategory = useMemo(() => {
    const categorySpend = getSpendByCategory();
    if (categorySpend.length === 0) return null;
    return {
      ...categorySpend[0],
      info: getCategoryInfo(categorySpend[0].category),
    };
  }, [transactions]);

  const totalSpend = getTotalSpend();

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
      >
        {/* Page Title */}
        <View style={styles.titleSection}>
          <View style={styles.localBadge}>
            <Ionicons name="eye-off" size={12} color="#0D5D56" />
            <Text style={styles.localText}>LOCAL ANALYSIS</Text>
          </View>
          <Text style={styles.pageTitle}>Spending Insights</Text>
          <Text style={styles.pageSubtitle}>
            Real-time financial intelligence calculated exclusively on your device. Your raw data never leaves this vault.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.periodButton}>
            <Text style={styles.periodText}>Last 30 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exportButton}>
            <Text style={styles.exportText}>Export Report</Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Expenditure */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Weekly Expenditure</Text>
              <Text style={styles.cardSubtitle}>Spending velocity over the last 7 days</Text>
            </View>
            <View style={styles.weeklyAmount}>
              <Text style={styles.weeklyValue}>₹{formatAmount(weeklyData)}</Text>
              <Text style={styles.weeklyTrend}>+12% VS LAST WEEK</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            <BarChart
              data={barData}
              width={SCREEN_WIDTH - 80}
              height={120}
              barWidth={28}
              spacing={16}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              yAxisTextStyle={{ color: 'transparent' }}
              xAxisLabelTextStyle={styles.barLabel}
              noOfSections={4}
              maxValue={10}
            />
          </View>
        </View>

        {/* Allocation Donut */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Allocation</Text>
          
          <View style={styles.donutContainer}>
            <PieChart
              data={allocationData}
              donut
              radius={80}
              innerRadius={50}
              centerLabelComponent={() => (
                <View style={styles.donutCenter}>
                  <Text style={styles.donutLabel}>TOTAL</Text>
                  <Text style={styles.donutValue}>₹{Math.round(totalSpend / 1000)}k</Text>
                </View>
              )}
            />
            
            <View style={styles.legendContainer}>
              {allocationData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.label}</Text>
                  <Text style={styles.legendPercent}>{item.text}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Efficiency Score */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Efficiency Score</Text>
          <Text style={styles.cardSubtitle}>Financial health based on local patterns.</Text>
          
          <View style={styles.scoreRow}>
            <Text style={styles.scoreValue}>84</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          
          <View style={styles.tipBox}>
            <Ionicons name="bulb-outline" size={20} color="#0D5D56" />
            <Text style={styles.tipText}>
              Reducing "Lifestyle" expenses by 4% could reach your savings goal 3 months faster.
            </Text>
          </View>
        </View>

        {/* Top Spending Category */}
        {topCategory && (
          <View style={styles.topCategoryCard}>
            <Text style={styles.topCategoryLabel}>Top Spending Category</Text>
            <Text style={styles.topCategoryName}>{topCategory.info.name}</Text>
            <Text style={styles.topCategorySubtext}>MONTHLY TOTAL</Text>
            <View style={styles.topCategoryRow}>
              <Text style={styles.topCategoryAmount}>₹{formatAmount(topCategory.amount)}</Text>
              <View style={styles.topCategoryIcon}>
                <Ionicons name={topCategory.info.icon as any} size={24} color="#FFFFFF" />
              </View>
            </View>
            <Text style={styles.topCategoryTrend}>24% higher than your 6-month average</Text>
          </View>
        )}

        {/* Privacy Registry */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Privacy Registry</Text>
          
          <View style={styles.privacyItem}>
            <View style={styles.privacyIcon}>
              <Ionicons name="eye-off" size={20} color="#6B7280" />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Anonymized Data</Text>
              <Text style={styles.privacyDesc}>Personal identifiers removed before local processing.</Text>
            </View>
          </View>
          
          <View style={styles.privacyItem}>
            <View style={styles.privacyIcon}>
              <Ionicons name="layers" size={20} color="#6B7280" />
            </View>
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>Zero-Knowledge Compute</Text>
              <Text style={styles.privacyDesc}>Analysis results are ephemeral and cleared on logout.</Text>
            </View>
          </View>
        </View>
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
  titleSection: {
    marginBottom: 20,
  },
  localBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  localText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0D5D56',
    marginLeft: 6,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  periodButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  exportButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0D5D56',
  },
  exportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  weeklyAmount: {
    alignItems: 'flex-end',
  },
  weeklyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  weeklyTrend: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  chartContainer: {
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  donutCenter: {
    alignItems: 'center',
  },
  donutLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  donutValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  legendContainer: {
    flex: 1,
    marginLeft: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
  },
  legendPercent: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 12,
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#0D5D56',
  },
  scoreMax: {
    fontSize: 20,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5F3',
    borderRadius: 12,
    padding: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#0D5D56',
    marginLeft: 12,
    lineHeight: 18,
  },
  topCategoryCard: {
    backgroundColor: '#0D5D56',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  topCategoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  topCategoryName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  topCategorySubtext: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  topCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  topCategoryAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCategoryTrend: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 12,
  },
  privacyItem: {
    flexDirection: 'row',
    marginTop: 16,
  },
  privacyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyContent: {
    flex: 1,
    marginLeft: 12,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  privacyDesc: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

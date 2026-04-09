import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { InsightsCard, SpendingByCategory } from '../../src/components';
import { formatCurrency, isCurrentMonth } from '../../src/utils/formatters';
import { getCategoryInfo } from '../../src/utils/categories';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

const { width } = Dimensions.get('window');

export default function InsightsScreen() {
  const { transactions, settings, getSpendByCategory, getMonthlySpend } = useApp();

  const monthlySpend = getMonthlySpend();
  const categorySpend = getSpendByCategory();

  // Weekly spending data
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return days.map((label, i) => {
      const date = format(addDays(weekStart, i), 'yyyy-MM-dd');
      const daySpend = transactions
        .filter(t => !t.isCredit && t.date === date)
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        value: daySpend / 100, // Scale for chart
        label,
        frontColor: i === (new Date().getDay() + 6) % 7 ? '#1a1a1a' : '#e0e0e0',
      };
    });
  }, [transactions]);

  // Pie chart data
  const pieData = useMemo(() => {
    const colors = ['#059669', '#2563eb', '#7c3aed', '#dc2626', '#ea580c', '#0d9488'];
    return categorySpend.slice(0, 6).map((item, i) => ({
      value: item.amount,
      color: colors[i % colors.length],
      text: getCategoryInfo(item.category).name,
    }));
  }, [categorySpend]);

  // Monthly income vs expense
  const monthlyIncome = useMemo(() => {
    return transactions
      .filter(t => t.isCredit && isCurrentMonth(t.date))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: '#fef2f2' }]}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, { color: '#dc2626' }]}>
              {formatCurrency(monthlySpend)}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: '#ecfdf5' }]}>
            <Text style={styles.summaryLabel}>Received</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              {formatCurrency(monthlyIncome)}
            </Text>
          </View>
        </View>

        {/* AI Insights */}
        <InsightsCard 
          transactions={transactions.filter(t => isCurrentMonth(t.date))} 
          apiKey={settings.openRouterApiKey} 
        />

        {/* Weekly Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>This Week</Text>
          <View style={styles.chartWrap}>
            <BarChart
              data={weeklyData}
              width={width - 80}
              height={120}
              barWidth={28}
              spacing={14}
              roundedTop
              roundedBottom
              hideRules
              xAxisThickness={0}
              yAxisThickness={0}
              noOfSections={3}
              maxValue={Math.max(...weeklyData.map(d => d.value), 10)}
              xAxisLabelTextStyle={{ fontSize: 11, color: '#888' }}
              yAxisTextStyle={{ color: 'transparent' }}
            />
          </View>
        </View>

        {/* Pie Chart */}
        {pieData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>By Category</Text>
            <View style={styles.pieWrap}>
              <PieChart
                data={pieData}
                donut
                radius={70}
                innerRadius={45}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: '#888' }}>Total</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>
                      {formatCurrency(monthlySpend)}
                    </Text>
                  </View>
                )}
              />
              <View style={styles.legend}>
                {pieData.map((item, i) => (
                  <View key={i} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Category Breakdown */}
        <SpendingByCategory data={categorySpend} total={monthlySpend} />
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
  scroll: {
    flex: 1,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  chartWrap: {
    alignItems: 'center',
  },
  pieWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  legend: {
    flex: 1,
    marginLeft: 20,
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
    fontSize: 13,
    color: '#555',
  },
});

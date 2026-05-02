import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-gifted-charts';
import { format, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { useApp } from '../../src/context/AppContext';
import { colors, radius, spacing, typography } from '../../src/theme/design';
import { formatCompact, isCurrentMonth } from '../../src/utils/formatters';
import { getCategoryInfo, EXPENSE_CATEGORIES } from '../../src/utils/categories';
import { generateInsights, getBasicInsights, AIInsight } from '../../src/services/aiInsights';
import { InsightCard } from '../../src/components/InsightCard';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { transactions, settings, budgets } = useApp();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Last 6 months data for bar chart
  const monthlyData = useMemo(() => {
    const months: { label: string; expense: number; income: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      let exp = 0, inc = 0;
      transactions.forEach((t) => {
        try {
          const td = parseISO(t.date);
          if (isWithinInterval(td, { start, end })) {
            if (t.isCredit) inc += t.amount;
            else exp += t.amount;
          }
        } catch {}
      });
      months.push({ label: format(d, 'MMM'), expense: exp, income: inc });
    }
    return months;
  }, [transactions]);

  // Bar chart data
  const barData = useMemo(() => {
    const data: any[] = [];
    monthlyData.forEach((m) => {
      data.push({
        value: m.expense,
        label: m.label,
        frontColor: colors.error,
        spacing: 4,
        labelTextStyle: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
      });
      data.push({ value: m.income, frontColor: colors.success });
    });
    return data;
  }, [monthlyData]);

  const maxVal = Math.max(...monthlyData.flatMap((m) => [m.expense, m.income]), 100);

  // Category breakdown (this month)
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.isCredit) return;
      if (!isCurrentMonth(t.date)) return;
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const tot = sorted.reduce((s, [, v]) => s + v, 0);
    return { list: sorted, total: tot };
  }, [transactions]);

  // Biggest transactions (this month)
  const biggestTx = useMemo(() => {
    return transactions
      .filter((t) => isCurrentMonth(t.date) && !t.isCredit)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [transactions]);

  // MoM change
  const momChange = useMemo(() => {
    const thisMonth = monthlyData[monthlyData.length - 1]?.expense || 0;
    const lastMonth = monthlyData[monthlyData.length - 2]?.expense || 0;
    if (lastMonth === 0) return { pct: 0, diff: thisMonth };
    return {
      pct: Math.round(((thisMonth - lastMonth) / lastMonth) * 100),
      diff: thisMonth - lastMonth,
    };
  }, [monthlyData]);

  // Day-of-week spending
  const dayOfWeek = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const totals = [0, 0, 0, 0, 0, 0, 0];
    transactions.forEach((t) => {
      if (t.isCredit || !isCurrentMonth(t.date)) return;
      try {
        const d = parseISO(t.date);
        totals[d.getDay()] += t.amount;
      } catch {}
    });
    const max = Math.max(...totals, 1);
    return totals.map((v, i) => ({ label: days[i], value: v, pct: (v / max) * 100 }));
  }, [transactions]);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const thisMonth = transactions.filter((t) => isCurrentMonth(t.date));
    if (settings.enableAiInsights && settings.openRouterApiKey) {
      const result = await generateInsights(thisMonth, settings.openRouterApiKey, settings.aiModel);
      setInsights(result);
    } else {
      setInsights(getBasicInsights(thisMonth));
    }
    setLoadingInsights(false);
  };

  useEffect(() => {
    const thisMonth = transactions.filter((t) => isCurrentMonth(t.date));
    setInsights(getBasicInsights(thisMonth));
  }, [transactions]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Understand where your money goes</Text>

        {/* Monthly trend */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>6-Month Trend</Text>
            <View style={styles.legendMini}>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.error }]} /><Text style={styles.legendText}>Expense</Text></View>
              <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: colors.success }]} /><Text style={styles.legendText}>Income</Text></View>
            </View>
          </View>
          {barData.some((d) => d.value > 0) ? (
            <BarChart
              data={barData}
              barWidth={14}
              barBorderRadius={4}
              spacing={12}
              maxValue={maxVal * 1.2}
              noOfSections={4}
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: colors.textTertiary, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 11 }}
              height={180}
              width={width - 96}
              rulesColor={colors.borderLight}
              rulesType="solid"
              hideRules={false}
              formatYLabel={(v) => formatCompact(Number(v))}
            />
          ) : (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No data yet</Text>
            </View>
          )}
        </View>

        {/* MoM comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Month-over-Month</Text>
          <View style={styles.momRow}>
            <View style={styles.momItem}>
              <Text style={styles.momLabel}>This month</Text>
              <Text style={styles.momValue}>{'₹' + formatCompact(monthlyData[monthlyData.length - 1]?.expense || 0)}</Text>
            </View>
            <View style={styles.momDivider} />
            <View style={styles.momItem}>
              <Text style={styles.momLabel}>Last month</Text>
              <Text style={styles.momValue}>{'₹' + formatCompact(monthlyData[monthlyData.length - 2]?.expense || 0)}</Text>
            </View>
          </View>
          <View style={[styles.momBanner, { backgroundColor: momChange.pct >= 0 ? colors.errorBg : colors.successBg }]}>
            <Ionicons
              name={momChange.pct >= 0 ? 'trending-up' : 'trending-down'}
              size={16}
              color={momChange.pct >= 0 ? colors.error : colors.success}
            />
            <Text style={[styles.momText, { color: momChange.pct >= 0 ? colors.error : colors.success }]}>
              {(momChange.pct >= 0 ? '+' : '') + momChange.pct + '% vs last month'}
            </Text>
          </View>
        </View>

        {/* Top Categories */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Top Categories</Text>
          <Text style={styles.cardSub}>This month</Text>
          {categoryBreakdown.list.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>No expenses yet</Text></View>
          ) : (
            <View style={{ marginTop: spacing.md, gap: 12 }}>
              {categoryBreakdown.list.slice(0, 5).map(([cat, amount]) => {
                const info = getCategoryInfo(cat as any);
                const pct = Math.round((amount / categoryBreakdown.total) * 100);
                return (
                  <View key={cat}>
                    <View style={styles.catRow}>
                      <View style={[styles.catIcon, { backgroundColor: info.bgColor }]}>
                        <Ionicons name={info.icon as any} size={14} color={info.color} />
                      </View>
                      <Text style={styles.catName}>{info.name}</Text>
                      <Text style={styles.catAmount}>{'₹' + formatCompact(amount)}</Text>
                    </View>
                    <View style={styles.progressBg}>
                      <View style={[styles.progressFill, { width: (pct + '%') as any, backgroundColor: info.color }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Day-of-week */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Spending by Day</Text>
          <Text style={styles.cardSub}>Which day you spend most</Text>
          <View style={styles.dowRow}>
            {dayOfWeek.map((d) => (
              <View key={d.label} style={styles.dowCol}>
                <View style={styles.dowBarWrap}>
                  <View style={[styles.dowBar, { height: Math.max(d.pct, 4) + '%', backgroundColor: colors.accent } as any]} />
                </View>
                <Text style={styles.dowLabel}>{d.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Biggest transactions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Biggest Transactions</Text>
          <Text style={styles.cardSub}>This month</Text>
          {biggestTx.length === 0 ? (
            <View style={styles.emptyBox}><Text style={styles.emptyText}>No data yet</Text></View>
          ) : (
            biggestTx.map((t) => {
              const info = getCategoryInfo(t.category);
              return (
                <View key={t.id} style={styles.bigRow}>
                  <View style={[styles.catIcon, { backgroundColor: info.bgColor }]}>
                    <Ionicons name={info.icon as any} size={14} color={info.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bigMerchant}>{t.merchant}</Text>
                    <Text style={styles.bigMeta}>{info.name}</Text>
                  </View>
                  <Text style={styles.bigAmount}>{'−₹' + formatCompact(t.amount)}</Text>
                </View>
              );
            })
          )}
        </View>

        {/* AI Insights */}
        <View style={styles.insightsHeader}>
          <View>
            <Text style={styles.cardTitle}>Insights</Text>
            <Text style={styles.cardSub}>{settings.enableAiInsights && settings.openRouterApiKey ? 'AI-powered' : 'Quick tips'}</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchInsights} disabled={loadingInsights}>
            {loadingInsights ? <ActivityIndicator size="small" color={colors.accent} /> : <Ionicons name="sparkles" size={16} color={colors.accent} />}
            <Text style={styles.refreshText}>{loadingInsights ? 'Analyzing' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>
        {insights.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Add transactions to see insights</Text>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            {insights.map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.title, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textSecondary, marginTop: 2, marginBottom: spacing.xl },
  card: { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderLight, marginBottom: spacing.lg },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  cardTitle: { ...typography.subtitle, color: colors.textPrimary },
  cardSub: { ...typography.small, color: colors.textTertiary, marginTop: 2 },
  legendMini: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: colors.textSecondary, fontWeight: '600' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyText: { fontSize: 13, color: colors.textTertiary },
  momRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  momItem: { flex: 1 },
  momLabel: { fontSize: 11, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', letterSpacing: 0.6 },
  momValue: { fontSize: 22, fontWeight: '700', color: colors.textPrimary, marginTop: 4, letterSpacing: -0.4 },
  momDivider: { width: 1, height: 40, backgroundColor: colors.borderLight, marginHorizontal: spacing.md },
  momBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.md, borderRadius: radius.md, marginTop: spacing.md },
  momText: { fontSize: 13, fontWeight: '700' },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  catIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  catName: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.textPrimary },
  catAmount: { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  progressBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  dowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110, marginTop: spacing.lg },
  dowCol: { flex: 1, alignItems: 'center' },
  dowBarWrap: { width: 20, height: 80, backgroundColor: colors.borderLight, borderRadius: 4, justifyContent: 'flex-end', overflow: 'hidden' },
  dowBar: { width: '100%', borderRadius: 4 },
  dowLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, marginTop: 6 },
  bigRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.sm },
  bigMerchant: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  bigMeta: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  bigAmount: { fontSize: 14, fontWeight: '700', color: colors.error },
  insightsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md, marginTop: spacing.sm },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7, paddingHorizontal: 12, backgroundColor: colors.infoBg, borderRadius: radius.full },
  refreshText: { fontSize: 12, fontWeight: '700', color: colors.accent },
});

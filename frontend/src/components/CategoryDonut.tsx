import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCompact } from '../utils/formatters';
import { colors, radius, spacing, typography } from '../theme/design';

interface Props {
  transactions: Transaction[];
}

export const CategoryDonut: React.FC<Props> = ({ transactions }) => {
  const [mode, setMode] = useState<'expense' | 'income'>('expense');

  const { slices, total, topCategory } = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      const isMatch = mode === 'expense' ? !t.isCredit : t.isCredit;
      if (!isMatch) return;
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const tot = sorted.reduce((s, [, v]) => s + v, 0);
    const data = sorted.map(([cat, val]) => {
      const info = getCategoryInfo(cat as any);
      return { value: val, color: info.color, category: cat, name: info.name };
    });
    return { slices: data, total: tot, topCategory: sorted[0] };
  }, [transactions, mode]);

  const topInfo = topCategory ? getCategoryInfo(topCategory[0] as any) : null;
  const topPct = topCategory ? Math.round((topCategory[1] / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>By Category</Text>
        <View style={styles.toggle}>
          {(['expense', 'income'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.toggleBtn, mode === m && styles.toggleActive]}
            >
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                {m === 'expense' ? 'Expense' : 'Income'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {slices.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pie-chart-outline" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No {mode} data yet</Text>
        </View>
      ) : (
        <>
          <View style={styles.chartRow}>
            <View style={styles.chartWrap}>
              <PieChart
                data={slices}
                donut
                radius={70}
                innerRadius={50}
                innerCircleColor={colors.surfaceElevated}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={styles.centerLabel}>{mode === 'expense' ? 'Spent' : 'Income'}</Text>
                    <Text style={styles.centerValue}>{'₹' + formatCompact(total)}</Text>
                  </View>
                )}
              />
            </View>
            <View style={styles.legend}>
              {slices.slice(0, 5).map((s, i) => {
                const pct = Math.round((s.value / total) * 100);
                return (
                  <View key={i} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendName} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.legendPct}>{pct + '%'}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          {topInfo ? (
            <View style={styles.footer}>
              <View style={[styles.footerDot, { backgroundColor: topInfo.color }]} />
              <Text style={styles.footerText}>
                Top: <Text style={styles.footerBold}>{topInfo.name}</Text>
                {' · ' + topPct + '%'}
              </Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { ...typography.subtitle, color: colors.textPrimary },
  toggle: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.full, padding: 3 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  toggleActive: { backgroundColor: colors.primary },
  toggleText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  toggleTextActive: { color: '#fff' },
  chartRow: { flexDirection: 'row', alignItems: 'center' },
  chartWrap: { width: 150, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontSize: 10, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
  centerValue: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  legend: { flex: 1, marginLeft: spacing.md, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '500', color: colors.textPrimary },
  legendPct: { fontSize: 12, fontWeight: '700', color: colors.textSecondary },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight },
  footerDot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  footerText: { fontSize: 12, color: colors.textSecondary },
  footerBold: { fontWeight: '700', color: colors.textPrimary },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyText: { fontSize: 13, color: colors.textTertiary },
});

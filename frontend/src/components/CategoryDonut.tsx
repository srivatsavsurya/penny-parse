import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCompact } from '../utils/formatters';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { spacing, radius, typography } from '../theme/design';

interface Props {
  transactions: Transaction[];
  hide?: boolean;
}

export const CategoryDonut: React.FC<Props> = ({ transactions, hide }) => {
  const { colors } = useTheme();
  const { customCategories } = useApp();
  const [mode, setMode] = useState<'expense' | 'income'>('expense');
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { slices, total } = useMemo(() => {
    const map: Record<string, number> = {};
    transactions.forEach((t) => {
      const isMatch = mode === 'expense' ? !t.isCredit : t.isCredit;
      if (!isMatch) return;
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const tot = sorted.reduce((s, [, v]) => s + v, 0);
    const data = sorted.map(([cat, val]) => {
      const info = getCategoryInfo(cat as any, customCategories);
      return { value: val, color: info.color, category: cat, name: info.name };
    });
    return { slices: data, total: tot };
  }, [transactions, mode, customCategories]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>By Category</Text>
        <View style={styles.toggle}>
          {(['expense', 'income'] as const).map((m) => (
            <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.toggleBtn, mode === m && { backgroundColor: colors.accent }]}>
              <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>{m === 'expense' ? 'Expense' : 'Income'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {slices.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="pie-chart-outline" size={32} color={colors.textTertiary} />
          <Text style={styles.emptyText}>No {mode} data</Text>
        </View>
      ) : (
        <View style={styles.chartRow}>
          <View style={styles.chartWrap}>
            <PieChart
              data={slices}
              donut
              radius={70}
              innerRadius={50}
              innerCircleColor={colors.surface}
              centerLabelComponent={() => (
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.centerLabel}>{mode === 'expense' ? 'Spent' : 'Income'}</Text>
                  <Text style={styles.centerValue}>{hide ? '\u2022\u2022\u2022' : '\u20b9' + formatCompact(total)}</Text>
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
      )}
    </View>
  );
};

const makeStyles = (c: any) => StyleSheet.create({
  card: { backgroundColor: c.surface, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: c.borderLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { ...typography.subtitle, color: c.textPrimary },
  toggle: { flexDirection: 'row', backgroundColor: c.surfaceSecondary, borderRadius: radius.full, padding: 3 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.full },
  toggleText: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
  toggleTextActive: { color: '#fff' },
  chartRow: { flexDirection: 'row', alignItems: 'center' },
  chartWrap: { width: 150, alignItems: 'center', justifyContent: 'center' },
  centerLabel: { fontSize: 10, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.5, textTransform: 'uppercase' },
  centerValue: { fontSize: 18, fontWeight: '700', color: c.textPrimary, marginTop: 2 },
  legend: { flex: 1, marginLeft: spacing.md, gap: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendName: { flex: 1, fontSize: 13, fontWeight: '500', color: c.textPrimary },
  legendPct: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm },
  emptyText: { fontSize: 13, color: c.textTertiary },
});

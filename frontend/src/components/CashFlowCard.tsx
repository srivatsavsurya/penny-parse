import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { formatCompact, isCurrentMonth } from '../utils/formatters';
import { colors, radius, spacing, typography } from '../theme/design';

interface Props {
  transactions: Transaction[];
}

export const CashFlowCard: React.FC<Props> = ({ transactions }) => {
  const { income, expense, net } = useMemo(() => {
    let inc = 0, exp = 0;
    transactions.forEach((t) => {
      if (!isCurrentMonth(t.date)) return;
      if (t.isCredit) inc += t.amount;
      else exp += t.amount;
    });
    return { income: inc, expense: exp, net: inc - exp };
  }, [transactions]);

  const max = Math.max(income, expense, 1);
  const incPct = (income / max) * 100;
  const expPct = (expense / max) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Cash Flow</Text>
        <Text style={styles.subtitle}>This month</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.label}>Income</Text>
          </View>
          <Text style={styles.value}>{'₹' + formatCompact(income)}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: (incPct + '%') as any, backgroundColor: colors.success }]} />
          </View>
        </View>
        <View style={{ width: spacing.md }} />
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: colors.error }]} />
            <Text style={styles.label}>Expense</Text>
          </View>
          <Text style={styles.value}>{'₹' + formatCompact(expense)}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: (expPct + '%') as any, backgroundColor: colors.error }]} />
          </View>
        </View>
      </View>

      <View style={styles.netRow}>
        <Ionicons
          name={net >= 0 ? 'trending-up' : 'trending-down'}
          size={14}
          color={net >= 0 ? colors.success : colors.error}
        />
        <Text style={[styles.netText, { color: net >= 0 ? colors.success : colors.error }]}>
          {(net >= 0 ? 'Net positive ' : 'Net negative ') + '₹' + formatCompact(Math.abs(net))}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surfaceElevated, borderRadius: radius.xl, padding: spacing.xl, borderWidth: 1, borderColor: colors.borderLight },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { ...typography.subtitle, color: colors.textPrimary },
  subtitle: { ...typography.small, color: colors.textTertiary },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, letterSpacing: -0.4 },
  barBg: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  netRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 6 },
  netText: { fontSize: 13, fontWeight: '600' },
});

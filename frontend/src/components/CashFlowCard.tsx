import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Polyline, Line as SvgLine, Circle } from 'react-native-svg';
import { parseISO, differenceInCalendarDays, subDays, format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { Transaction } from '../types';
import { formatCompact } from '../utils/formatters';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, radius, typography } from '../theme/design';

interface Props {
  /** All transactions — card handles its own range filtering. */
  transactions: Transaction[];
  hide?: boolean;
}

type RangeKey = '7d' | '30d' | '90d' | '6m' | '1y';

const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '6m', label: '6M', days: 180 },
  { key: '1y', label: '1Y', days: 365 },
];

interface Bucket { day: string; net: number; income: number; expense: number; }

function buildBuckets(txns: Transaction[], start: Date, days: number): Bucket[] {
  // 1 bucket per day if <= 30 days, otherwise sample into ~30 buckets
  const buckets: Bucket[] = [];
  const targetBuckets = Math.min(days, 30);
  const daysPerBucket = Math.max(1, Math.floor(days / targetBuckets));
  for (let i = 0; i < targetBuckets; i++) {
    const bStart = subDays(new Date(start.getTime() + (days - 1) * 86400000), (targetBuckets - 1 - i) * daysPerBucket + daysPerBucket - 1);
    buckets.push({ day: format(bStart, 'yyyy-MM-dd'), net: 0, income: 0, expense: 0 });
  }
  txns.forEach((t) => {
    try {
      const d = parseISO(t.date);
      const diff = differenceInCalendarDays(d, start);
      if (diff < 0 || diff >= days) return;
      const idx = Math.min(targetBuckets - 1, Math.floor(diff / daysPerBucket));
      if (t.isCredit) buckets[idx].income += t.amount;
      else buckets[idx].expense += t.amount;
      buckets[idx].net = buckets[idx].income - buckets[idx].expense;
    } catch { /* ignore */ }
  });
  return buckets;
}

export const CashFlowCard: React.FC<Props> = ({ transactions, hide }) => {
  const { colors, isDark } = useTheme();
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [chartW, setChartW] = useState(0);

  const { current, previous, buckets, days } = useMemo(() => {
    const d = RANGES.find((r) => r.key === rangeKey)?.days || 30;
    const now = new Date();
    const curStart = subDays(now, d - 1);
    const prevStart = subDays(now, d * 2 - 1);
    const prevEnd = subDays(now, d);

    let curInc = 0, curExp = 0, prvInc = 0, prvExp = 0;
    transactions.forEach((t) => {
      try {
        const td = parseISO(t.date);
        if (td >= curStart && td <= now) {
          if (t.isCredit) curInc += t.amount; else curExp += t.amount;
        } else if (td >= prevStart && td <= prevEnd) {
          if (t.isCredit) prvInc += t.amount; else prvExp += t.amount;
        }
      } catch { /* ignore */ }
    });
    const bkts = buildBuckets(transactions, curStart, d);
    return {
      current: { income: curInc, expense: curExp, net: curInc - curExp },
      previous: { income: prvInc, expense: prvExp, net: prvInc - prvExp },
      buckets: bkts,
      days: d,
    };
  }, [transactions, rangeKey]);

  // pct change of net vs previous
  const netChange = useMemo(() => {
    if (previous.net === 0) return current.net === 0 ? 0 : null; // null = infinite/new
    return ((current.net - previous.net) / Math.abs(previous.net)) * 100;
  }, [current, previous]);

  const max = Math.max(current.income, current.expense, 1);
  const incPct = (current.income / max) * 100;
  const expPct = (current.expense / max) * 100;

  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const mask = (v: string) => (hide ? '\u2022\u2022\u2022\u2022' : v);

  const chartH = 44;
  const netValues = buckets.map((b) => b.net);
  const minNet = Math.min(0, ...netValues);
  const maxNet = Math.max(0, ...netValues);
  const netRange = Math.max(1, maxNet - minNet);
  const points = buckets
    .map((b, i) => {
      const x = (i / Math.max(1, buckets.length - 1)) * (chartW || 300);
      const y = chartH - ((b.net - minNet) / netRange) * chartH;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const zeroY = chartH - ((0 - minNet) / netRange) * chartH;

  const onChangeRange = (k: RangeKey) => {
    if (k === rangeKey) return;
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync().catch(() => {});
    }
    setRangeKey(k);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Cash Flow</Text>
          <View style={styles.subRow}>
            <Ionicons
              name={
                netChange === null ? 'sparkles-outline' :
                netChange >= 0 ? 'trending-up' : 'trending-down'
              }
              size={13}
              color={netChange === null ? colors.textTertiary : netChange >= 0 ? colors.success : colors.error}
            />
            <Text style={[
              styles.subtitle,
              { color: netChange === null ? colors.textTertiary : netChange >= 0 ? colors.success : colors.error },
            ]}>
              {netChange === null ? 'New activity' : `${netChange >= 0 ? '+' : ''}${netChange.toFixed(0)}% vs prev`}
            </Text>
          </View>
        </View>
      </View>

      {/* Range chips */}
      <View style={styles.chipsRow}>
        {RANGES.map((r) => {
          const sel = rangeKey === r.key;
          return (
            <TouchableOpacity
              key={r.key}
              style={[styles.chip, sel && styles.chipActive]}
              onPress={() => onChangeRange(r.key)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, sel && styles.chipTextActive]}>{r.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sparkline */}
      <View style={styles.chartWrap} onLayout={(e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width)}>
        {chartW > 0 && buckets.length > 1 ? (
          <Svg width={chartW} height={chartH}>
            {/* zero baseline */}
            <SvgLine x1={0} y1={zeroY} x2={chartW} y2={zeroY} stroke={colors.borderLight} strokeWidth={1} strokeDasharray="3 4" />
            <Polyline
              points={points}
              fill="none"
              stroke={current.net >= 0 ? colors.success : colors.error}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* end dot */}
            {(() => {
              const last = buckets[buckets.length - 1];
              const x = chartW;
              const y = chartH - ((last.net - minNet) / netRange) * chartH;
              return <Circle cx={x - 3} cy={y} r={3.2} fill={current.net >= 0 ? colors.success : colors.error} />;
            })()}
          </Svg>
        ) : null}
      </View>

      {/* Income + Expense split */}
      <View style={styles.row}>
        <View style={styles.col}>
          <View style={styles.labelRow}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={styles.label}>Income</Text>
          </View>
          <Text style={styles.value}>{mask('\u20b9' + formatCompact(current.income))}</Text>
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
          <Text style={styles.value}>{mask('\u20b9' + formatCompact(current.expense))}</Text>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: (expPct + '%') as any, backgroundColor: colors.error }]} />
          </View>
        </View>
      </View>

      {/* Net summary */}
      <View style={styles.netRow}>
        <View style={[styles.netPill, { backgroundColor: current.net >= 0 ? colors.successBg : colors.errorBg }]}>
          <Ionicons name={current.net >= 0 ? 'arrow-up' : 'arrow-down'} size={12} color={current.net >= 0 ? colors.success : colors.error} />
          <Text style={[styles.netText, { color: current.net >= 0 ? colors.success : colors.error }]}>
            {(current.net >= 0 ? 'Net saved ' : 'Net spent ') + (hide ? '\u2022\u2022\u2022\u2022' : '\u20b9' + formatCompact(Math.abs(current.net)))}
          </Text>
        </View>
        <Text style={styles.footerHint}>{`Last ${days} days`}</Text>
      </View>
    </View>
  );
};

const makeStyles = (c: any, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: c.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: c.borderLight,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { ...typography.subtitle, color: c.textPrimary },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  subtitle: { fontSize: 12, fontWeight: '600' },

  chipsRow: { flexDirection: 'row', gap: 6, marginBottom: spacing.md },
  chip: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : c.surfaceSecondary,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  chipActive: { backgroundColor: c.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: c.textSecondary, letterSpacing: 0.3 },
  chipTextActive: { color: c.background === '#000000' ? '#000' : '#fff' },

  chartWrap: { height: 44, marginBottom: spacing.lg, overflow: 'hidden' },

  row: { flexDirection: 'row' },
  col: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 12, color: c.textSecondary, fontWeight: '500' },
  value: { fontSize: 20, fontWeight: '700', color: c.textPrimary, letterSpacing: -0.4 },
  barBg: { height: 6, backgroundColor: c.borderLight, borderRadius: 3, marginTop: spacing.sm, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  netRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: c.borderLight,
  },
  netPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  netText: { fontSize: 12, fontWeight: '700' },
  footerHint: { fontSize: 11, fontWeight: '600', color: c.textTertiary, letterSpacing: 0.3 },
});

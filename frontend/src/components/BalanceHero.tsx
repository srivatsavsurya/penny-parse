import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, radius } from '../theme/design';
import { formatCompact } from '../utils/formatters';

interface Props {
  balance: number;
  income: number;
  expense: number;
  hide: boolean;
  onToggleHide: () => void;
  /** % change of balance vs previous period (null = unknown / new). */
  trendPct?: number | null;
  /** Period label shown in the top-left, e.g. "This Month". */
  periodLabel?: string;
}

/**
 * Premium hero card for total balance.
 * - Extended gradient with soft ambient orbs (mesh feel)
 * - Trend indicator vs previous period
 * - Income / Expense mini stats
 * - Eye toggle for privacy
 */
export const BalanceHero: React.FC<Props> = ({
  balance,
  income,
  expense,
  hide,
  onToggleHide,
  trendPct = null,
  periodLabel = 'This Month',
}) => {
  const { colors, isDark } = useTheme();
  const styles = useMemo(() => makeStyles(colors, isDark), [colors, isDark]);
  const mask = (v: string) => (hide ? '\u2022\u2022\u2022\u2022\u2022' : v);

  const showTrend = trendPct !== null && Number.isFinite(trendPct);
  const trendUp = (trendPct ?? 0) >= 0;

  return (
    <View style={styles.wrap}>
      {/* Base gradient */}
      <LinearGradient
        colors={['#0A84FF', '#5E5CE6', '#7C3AED']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* Ambient orb – top right */}
      <View style={styles.orbTopRight} pointerEvents="none">
        <LinearGradient
          colors={['rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>
      {/* Ambient orb – bottom left */}
      <View style={styles.orbBottomLeft} pointerEvents="none">
        <LinearGradient
          colors={['rgba(94, 92, 230, 0.55)', 'rgba(94, 92, 230, 0)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />
      </View>
      {/* Subtle top-to-bottom sheen */}
      <LinearGradient
        colors={['rgba(255,255,255,0.10)', 'rgba(0,0,0,0.10)']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        pointerEvents="none"
      />

      {/* Content */}
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.periodLabel}>{periodLabel.toUpperCase()}</Text>
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <TouchableOpacity onPress={onToggleHide} style={styles.eyeBtn} activeOpacity={0.75} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name={hide ? 'eye-off' : 'eye'} size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.balanceRow}>
          <Text style={styles.balanceValue} numberOfLines={1} adjustsFontSizeToFit>
            {hide ? '\u2022\u2022\u2022\u2022\u2022\u2022' : '\u20b9' + formatCompact(balance)}
          </Text>
        </View>

        {showTrend ? (
          <View style={styles.trendPill}>
            <Ionicons
              name={trendUp ? 'trending-up' : 'trending-down'}
              size={12}
              color="#fff"
            />
            <Text style={styles.trendText}>
              {`${trendUp ? '+' : ''}${(trendPct as number).toFixed(1)}% vs previous`}
            </Text>
          </View>
        ) : null}

        <View style={styles.statRow}>
          <View style={styles.stat}>
            <View style={styles.statIconWrap}>
              <Ionicons name="arrow-down" size={12} color="#fff" />
            </View>
            <View>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {mask('\u20b9' + formatCompact(income))}
              </Text>
            </View>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <View style={styles.statIconWrap}>
              <Ionicons name="arrow-up" size={12} color="#fff" />
            </View>
            <View>
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {mask('\u20b9' + formatCompact(expense))}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (c: any, isDark: boolean) =>
  StyleSheet.create({
    wrap: {
      borderRadius: radius.xxl,
      overflow: 'hidden',
      minHeight: 210,
      ...Platform.select({
        ios: {
          shadowColor: '#0A84FF',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: isDark ? 0.55 : 0.28,
          shadowRadius: 28,
        },
        android: { elevation: 10 },
      }),
    },
    orbTopRight: {
      position: 'absolute',
      top: -60,
      right: -60,
      width: 220,
      height: 220,
      borderRadius: 110,
      opacity: 0.9,
      overflow: 'hidden',
    },
    orbBottomLeft: {
      position: 'absolute',
      bottom: -80,
      left: -60,
      width: 240,
      height: 240,
      borderRadius: 120,
      opacity: 0.85,
      overflow: 'hidden',
    },
    inner: { padding: spacing.xl },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    periodLabel: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.3,
    },
    balanceLabel: {
      color: 'rgba(255,255,255,0.92)',
      fontSize: 13,
      fontWeight: '600',
      marginTop: 2,
    },
    eyeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.16)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.24)',
    },
    balanceRow: { marginTop: 12 },
    balanceValue: {
      color: '#fff',
      fontSize: 44,
      fontWeight: '700',
      letterSpacing: -1.4,
    },
    trendPill: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.22)',
      marginTop: 10,
    },
    trendText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    statRow: {
      marginTop: spacing.lg,
      paddingTop: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.20)',
    },
    stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    statIconWrap: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.22)', marginHorizontal: spacing.md },
    statLabel: { color: 'rgba(255,255,255,0.72)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
    statValue: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 2 },
  });

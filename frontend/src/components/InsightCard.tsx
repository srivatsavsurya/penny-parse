import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AIInsight } from '../services/aiInsights';
import { colors, radius, spacing, typography } from '../theme/design';

interface Props {
  insight: AIInsight;
}

const STYLE_MAP: Record<string, { bg: string; color: string; icon: string }> = {
  tip: { bg: colors.infoBg, color: colors.info, icon: 'bulb' },
  warning: { bg: colors.warningBg, color: colors.warning, icon: 'warning' },
  info: { bg: colors.infoBg, color: colors.info, icon: 'information-circle' },
  success: { bg: colors.successBg, color: colors.success, icon: 'checkmark-circle' },
};

export const InsightCard: React.FC<Props> = ({ insight }) => {
  const s = STYLE_MAP[insight.type] || STYLE_MAP.info;
  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: s.bg }]}>
        <Ionicons name={(insight.icon || s.icon) as any} size={18} color={s.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.desc}>{insight.description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: colors.surfaceElevated, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.borderLight },
  iconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, marginLeft: spacing.md },
  title: { ...typography.bodySemibold, color: colors.textPrimary, marginBottom: 2 },
  desc: { ...typography.small, color: colors.textSecondary, lineHeight: 18 },
});

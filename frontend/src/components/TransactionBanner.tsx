import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Animated,
  Easing,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { CategoryType } from '../types';
import { EXPENSE_CATEGORIES, getCategoryInfo } from '../utils/categories';
import { suggestCategory } from '../utils/upiParser';
import { colors, radius, spacing, typography } from '../theme/design';

interface Props {
  visible: boolean;
  amount: number;
  merchant: string;
  isDebit: boolean;
  time: string;
  onConfirm: (category: CategoryType) => void;
  onDismiss: () => void;
}

const formatAmount = (amt: number) =>
  new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: amt % 1 === 0 ? 0 : 2,
  }).format(amt);

export const TransactionBanner: React.FC<Props> = ({
  visible,
  amount,
  merchant,
  isDebit,
  time,
  onConfirm,
  onDismiss,
}) => {
  const insets = useSafeAreaInsets();
  const suggested = useMemo(() => suggestCategory(merchant, !isDebit), [merchant, isDebit]);
  const [selected, setSelected] = React.useState<CategoryType>(suggested);

  const translateY = useRef(new Animated.Value(500)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(suggestCategory(merchant, !isDebit));
  }, [merchant, isDebit]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(500);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const close = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 600,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => cb());
  };

  if (!visible) return null;

  const suggestedInfo = getCategoryInfo(suggested);
  const amountColor = isDebit ? colors.textPrimary : colors.success;
  const dotColor = isDebit ? colors.error : colors.success;

  // Only expense categories when debit; show income sources for credit (just income)
  const categoryList = isDebit ? EXPENSE_CATEGORIES : [getCategoryInfo('income'), getCategoryInfo('transfer')];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => close(onDismiss)}
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => close(onDismiss)} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom + spacing.lg, spacing.xxl),
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={[styles.typeDot, { backgroundColor: dotColor }]} />
            <Text style={styles.typeLabel}>{isDebit ? 'Payment' : 'Received'}</Text>
            <Text style={styles.timeLabel}>{time}</Text>
          </View>

          {/* Uniform amount: sign + currency + number all same size */}
          <View style={styles.amountRow}>
            <Text style={[styles.amountText, { color: amountColor }]} numberOfLines={1}>
              <Text style={styles.amountText}>{isDebit ? '\u2212' : '+'}</Text>
              <Text style={styles.amountText}>{'\u20B9'}</Text>
              <Text style={styles.amountText}>{formatAmount(amount)}</Text>
            </Text>
          </View>

          <Text style={styles.merchant} numberOfLines={1}>{merchant}</Text>

          <View style={styles.divider} />

          <View style={styles.categoryHeader}>
            <Text style={styles.sectionLabel}>Category</Text>
            <View style={styles.suggestedPill}>
              <View style={[styles.suggestedDot, { backgroundColor: suggestedInfo.color }]} />
              <Text style={styles.suggestedText}>Suggested: {suggestedInfo.name}</Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categoryList.map((cat) => {
              const isSelected = selected === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelected(cat.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.chip,
                    isSelected && { backgroundColor: cat.color, borderColor: cat.color },
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? '#fff' : cat.color}
                  />
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => close(onDismiss)}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={() => close(() => onConfirm(selected))}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 24 },
    }),
  },
  handle: { width: 40, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  typeDot: { width: 6, height: 6, borderRadius: 3, marginRight: spacing.sm },
  typeLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, flex: 1 },
  timeLabel: { ...typography.caption, color: colors.textTertiary, letterSpacing: 0.4 },
  amountRow: { marginBottom: spacing.xs },
  amountText: {
    fontSize: 38,
    fontWeight: '600',
    letterSpacing: -0.8,
    lineHeight: 46,
  },
  merchant: { fontSize: 17, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.xl },
  divider: { height: 1, backgroundColor: colors.borderLight, marginBottom: spacing.xl },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionLabel: { ...typography.caption, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  suggestedPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.surface, borderRadius: radius.full },
  suggestedDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  suggestedText: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, letterSpacing: 0.2 },
  categoryScroll: { paddingRight: spacing.xxl, gap: spacing.sm, paddingVertical: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: 'transparent' },
  chipText: { fontSize: 14, fontWeight: '500', color: colors.textSecondary, marginLeft: 6 },
  chipTextSelected: { color: '#fff' },
  actions: { flexDirection: 'row', marginTop: spacing.xxl, gap: spacing.md },
  skipBtn: { flex: 1, height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.surface },
  skipText: { fontSize: 15, fontWeight: '600', color: colors.textSecondary },
  saveBtn: { flex: 2, flexDirection: 'row', height: 52, alignItems: 'center', justifyContent: 'center', borderRadius: radius.lg, backgroundColor: colors.primary },
  saveText: { fontSize: 15, fontWeight: '600', color: colors.textInverse, letterSpacing: 0.2 },
});

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
import { CATEGORIES, getCategoryInfo } from '../utils/categories';
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
  const suggested = useMemo(() => suggestCategory(merchant), [merchant]);
  const [selected, setSelected] = React.useState<CategoryType>(suggested);

  // Slide animation
  const translateY = useRef(new Animated.Value(400)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setSelected(suggestCategory(merchant));
  }, [merchant]);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 320,
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
      translateY.setValue(400);
      backdropOpacity.setValue(0);
    }
  }, [visible]);

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const handleConfirm = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 500,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onConfirm(selected));
  };

  if (!visible) return null;

  const suggestedInfo = getCategoryInfo(suggested);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
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
          {/* Grab handle */}
          <View style={styles.handle} />

          {/* Header row */}
          <View style={styles.header}>
            <View
              style={[
                styles.typeDot,
                { backgroundColor: isDebit ? colors.error : colors.success },
              ]}
            />
            <Text style={styles.typeLabel}>
              {isDebit ? 'Payment' : 'Received'}
            </Text>
            <Text style={styles.timeLabel}>{time}</Text>
          </View>

          {/* Amount */}
          <View style={styles.amountRow}>
            <Text
              style={[
                styles.amountSign,
                { color: isDebit ? colors.textPrimary : colors.success },
              ]}
            >
              {isDebit ? '\u2212' : '+'}
            </Text>
            <Text style={styles.currency}>{'\u20B9'}</Text>
            <Text
              style={[
                styles.amount,
                { color: isDebit ? colors.textPrimary : colors.success },
              ]}
            >
              {formatAmount(amount)}
            </Text>
          </View>

          {/* Merchant */}
          <Text style={styles.merchant} numberOfLines={1}>
            {merchant}
          </Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Category Label */}
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryLabel}>Category</Text>
            <View style={styles.suggestedPill}>
              <View
                style={[
                  styles.suggestedDot,
                  { backgroundColor: suggestedInfo.color },
                ]}
              />
              <Text style={styles.suggestedText}>Suggested</Text>
            </View>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selected === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelected(cat.id)}
                  activeOpacity={0.75}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={16}
                    color={isSelected ? colors.textInverse : cat.color}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleConfirm}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 24,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  typeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.sm,
  },
  typeLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    flex: 1,
  },
  timeLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  amountSign: {
    fontSize: 32,
    fontWeight: '300',
    marginRight: 2,
  },
  currency: {
    fontSize: 24,
    fontWeight: '400',
    color: colors.textSecondary,
    marginRight: 2,
  },
  amount: {
    fontSize: 40,
    fontWeight: '500',
    letterSpacing: -1,
    lineHeight: 46,
  },
  merchant: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.xl,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  suggestedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
  },
  suggestedDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 6,
  },
  suggestedText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  categoryScroll: {
    paddingRight: spacing.xxl,
    gap: spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 6,
  },
  chipTextSelected: {
    color: colors.textInverse,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  skipBtn: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textInverse,
    letterSpacing: 0.2,
  },
});

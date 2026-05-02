import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction, Account } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatAmount } from '../utils/formatters';
import { useTheme } from '../theme/ThemeProvider';
import { useApp } from '../context/AppContext';
import { spacing, typography } from '../theme/design';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  hideAmount?: boolean;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onPress, hideAmount }) => {
  const { colors } = useTheme();
  const { customCategories, accounts, openTransactionEditor } = useApp();
  const cat = getCategoryInfo(transaction.category, customCategories);
  const isCredit = transaction.isCredit;
  const acc: Account | undefined = transaction.accountId ? accounts.find((a) => a.id === transaction.accountId) : undefined;

  const handlePress = () => {
    if (onPress) onPress();
    else openTransactionEditor(transaction);
  };

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.surface }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Account color strip */}
      {acc ? <View style={[styles.accountStrip, { backgroundColor: acc.color }]} /> : <View style={styles.accountStripEmpty} />}

      <View style={[styles.iconWrap, { backgroundColor: cat.bgColor }]}>
        <Ionicons name={cat.icon as any} size={20} color={cat.color} />
      </View>
      <View style={styles.middle}>
        <Text style={[styles.merchant, { color: colors.textPrimary }]} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
          {cat.name + ' \u00b7 ' + transaction.time}
          {transaction.notes ? ' \u00b7 ' + transaction.notes : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: colors.textPrimary }, isCredit && { color: colors.success }]} numberOfLines={1}>
          {hideAmount ? '\u2022\u2022\u2022\u2022' : (isCredit ? '+' : '\u2212') + '\u20B9' + formatAmount(transaction.amount)}
        </Text>
        {transaction.source !== 'manual' && (
          <View style={styles.sourceTag}>
            <Ionicons name="flash" size={9} color={colors.textTertiary} />
            <Text style={[styles.sourceText, { color: colors.textTertiary }]}>Auto</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.lg, paddingLeft: 0 },
  accountStrip: { width: 4, alignSelf: 'stretch', marginRight: spacing.md, borderRadius: 2 },
  accountStripEmpty: { width: 4, alignSelf: 'stretch', marginRight: spacing.md },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, marginLeft: spacing.md },
  merchant: { ...typography.bodySemibold },
  meta: { ...typography.small, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' },
  sourceTag: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  sourceText: { fontSize: 10, fontWeight: '500' },
});

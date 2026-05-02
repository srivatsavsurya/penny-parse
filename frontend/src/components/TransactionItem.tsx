import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatAmount } from '../utils/formatters';
import { colors, spacing, typography } from '../theme/design';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  accountName?: string;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onPress, accountName }) => {
  const cat = getCategoryInfo(transaction.category);
  const isCredit = transaction.isCredit;

  const metaParts = [cat.name];
  if (accountName) metaParts.push(accountName);
  metaParts.push(transaction.time);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: cat.bgColor }]}>
        <Ionicons name={cat.icon as any} size={20} color={cat.color} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchant}</Text>
        <Text style={styles.meta} numberOfLines={1}>{metaParts.join(' · ')}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, isCredit && styles.credit]}>
          {(isCredit ? '+' : '−') + '₹' + formatAmount(transaction.amount)}
        </Text>
        {transaction.source === 'sms' && (
          <View style={styles.sourceTag}>
            <Ionicons name="flash" size={9} color={colors.textTertiary} />
            <Text style={styles.sourceText}>Auto</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  middle: { flex: 1, marginLeft: spacing.md },
  merchant: { ...typography.bodySemibold, color: colors.textPrimary },
  meta: { ...typography.small, color: colors.textSecondary, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  credit: { color: colors.success },
  sourceTag: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 3 },
  sourceText: { fontSize: 10, color: colors.textTertiary, fontWeight: '500' },
});

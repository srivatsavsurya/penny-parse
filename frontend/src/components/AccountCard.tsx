import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Account } from '../types';
import { formatCompact } from '../utils/formatters';
import { colors, radius, spacing } from '../theme/design';
import { getAccountIcon } from '../utils/accounts';

interface Props {
  account: Account;
  balance: number;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean;
}

export const AccountCard: React.FC<Props> = ({ account, balance, onPress, selected, compact }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.card,
        { backgroundColor: account.color },
        compact && styles.compact,
        selected && styles.selected,
      ]}
    >
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name={(account.icon || getAccountIcon(account.type)) as any} size={18} color="#fff" />
        </View>
        <Text style={styles.type}>{account.type.toUpperCase()}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>{account.name}</Text>
      <Text style={styles.balanceLabel}>Balance</Text>
      <Text style={styles.balance} numberOfLines={1}>{'₹' + formatCompact(balance)}</Text>
      {account.last4 ? <Text style={styles.last4}>{'•••• ' + account.last4}</Text> : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 200,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginRight: spacing.md,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  compact: { width: 160, minHeight: 110, padding: spacing.md },
  selected: { borderWidth: 2, borderColor: colors.primary },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  type: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  name: { color: '#fff', fontSize: 14, fontWeight: '600', marginTop: spacing.md },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginTop: spacing.sm },
  balance: { color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginTop: 2 },
  last4: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginTop: 4, letterSpacing: 1 },
});

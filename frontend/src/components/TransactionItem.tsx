import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

interface Props {
  transaction: Transaction;
  onPress?: () => void;
}

export const TransactionItem: React.FC<Props> = ({ transaction, onPress }) => {
  const category = getCategoryInfo(transaction.category);
  const isCredit = transaction.isCredit;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.icon, { backgroundColor: category.color + '15' }]}>
        <Ionicons name={category.icon as any} size={20} color={category.color} />
      </View>
      
      <View style={styles.details}>
        <Text style={styles.merchant} numberOfLines={1}>{transaction.merchant}</Text>
        <Text style={styles.meta}>{transaction.time} • {category.name}</Text>
      </View>
      
      <Text style={[styles.amount, isCredit ? styles.credit : styles.debit]}>
        {isCredit ? '+' : '-'}{formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    marginLeft: 12,
  },
  merchant: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  meta: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: '600',
  },
  debit: {
    color: '#1a1a1a',
  },
  credit: {
    color: '#059669',
  },
});

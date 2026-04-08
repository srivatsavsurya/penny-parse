import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { getCategoryInfo } from '../utils/categories';
import { formatAmount, formatDate, formatTime } from '../utils/formatters';

interface TransactionCardProps {
  transaction: Transaction;
  onPress?: () => void;
  showDate?: boolean;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
  showDate = false,
}) => {
  const categoryInfo = getCategoryInfo(transaction.category);
  const isCredit = transaction.isCredit;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isCredit && styles.creditContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isCredit ? styles.creditIcon : { backgroundColor: categoryInfo.bgColor }]}>
        <Ionicons
          name={isCredit ? 'business' : (categoryInfo.icon as any)}
          size={20}
          color={isCredit ? '#FFFFFF' : categoryInfo.color}
        />
      </View>

      <View style={styles.detailsContainer}>
        {isCredit && transaction.notes && (
          <Text style={[styles.noteLabel, isCredit && styles.creditText]}>
            {transaction.notes.toUpperCase()}
          </Text>
        )}
        <Text style={[styles.merchant, isCredit && styles.creditText]} numberOfLines={1}>
          {transaction.merchant}
        </Text>
        <Text style={[styles.subtitle, isCredit && styles.creditSubtext]}>
          {transaction.time} • {categoryInfo.name.toUpperCase()}
        </Text>
      </View>

      <View style={styles.amountContainer}>
        <Text style={[styles.amount, isCredit ? styles.creditAmount : styles.debitAmount]}>
          {isCredit ? '+' : '-'}₹{formatAmount(transaction.amount)}
        </Text>
        {transaction.verified && (
          <View style={[styles.verifiedBadge, isCredit && styles.creditBadge]}>
            <Text style={[styles.verifiedText, isCredit && styles.creditBadgeText]}>
              {transaction.verified === 'ENCRYPTED' ? 'ENCRYPTED' : 'UPI VERIFIED'}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  creditContainer: {
    backgroundColor: '#0D5D56',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
  },
  noteLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  merchant: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  creditText: {
    color: '#FFFFFF',
  },
  creditSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: '700',
  },
  debitAmount: {
    color: '#991B1B',
  },
  creditAmount: {
    color: '#4ADE80',
  },
  verifiedBadge: {
    backgroundColor: '#E8F5F3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  creditBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#0D5D56',
  },
  creditBadgeText: {
    color: '#FFFFFF',
  },
});

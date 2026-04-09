import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCategoryInfo } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';
import { CategoryType } from '../types';

interface Props {
  data: { category: CategoryType; amount: number }[];
  total: number;
  onCategoryPress?: (category: CategoryType) => void;
}

export const SpendingByCategory: React.FC<Props> = ({ data, total, onCategoryPress }) => {
  if (data.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spending</Text>
      {data.slice(0, 5).map(item => {
        const cat = getCategoryInfo(item.category);
        const percent = total > 0 ? (item.amount / total) * 100 : 0;
        
        return (
          <TouchableOpacity 
            key={item.category} 
            style={styles.row}
            onPress={() => onCategoryPress?.(item.category)}
            activeOpacity={0.7}
          >
            <View style={[styles.icon, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon as any} size={16} color={cat.color} />
            </View>
            <Text style={styles.name}>{cat.name}</Text>
            <View style={styles.barContainer}>
              <View style={[styles.bar, { width: `${percent}%`, backgroundColor: cat.color }]} />
            </View>
            <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    color: '#555',
    width: 70,
    marginLeft: 10,
  },
  barContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    marginHorizontal: 10,
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    width: 70,
    textAlign: 'right',
  },
});

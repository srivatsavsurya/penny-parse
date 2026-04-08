import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryInfo } from '../utils/categories';
import { formatAmount } from '../utils/formatters';
import { CategoryType } from '../types';

interface CategoryBreakdownProps {
  data: { category: CategoryType; amount: number }[];
  totalSpend: number;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data, totalSpend }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Breakdown</Text>
      {data.map((item, index) => {
        const categoryInfo = getCategoryInfo(item.category);
        const percentage = totalSpend > 0 ? (item.amount / totalSpend) * 100 : 0;
        
        return (
          <View key={item.category} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.categoryName}>{categoryInfo.name.toUpperCase()}</Text>
              <Text style={styles.amount}>₹{formatAmount(item.amount)}</Text>
            </View>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${percentage}%`,
                    backgroundColor: categoryInfo.color,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  row: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  amount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryType } from '../types';
import { getCategoryInfo } from '../utils/categories';

interface CategoryChipProps {
  category: CategoryType;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'large';
  suggested?: boolean;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  category,
  selected = false,
  onPress,
  size = 'large',
  suggested = false,
}) => {
  const categoryInfo = getCategoryInfo(category);
  const isLarge = size === 'large';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerSmall,
        selected && styles.selectedContainer,
        !selected && { backgroundColor: '#F5F5F5' },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconWrapper,
        isLarge ? styles.iconWrapperLarge : styles.iconWrapperSmall,
        selected && { backgroundColor: 'rgba(255,255,255,0.2)' },
        !selected && { backgroundColor: categoryInfo.bgColor },
      ]}>
        <Ionicons
          name={categoryInfo.icon as any}
          size={isLarge ? 24 : 18}
          color={selected ? '#FFFFFF' : categoryInfo.color}
        />
      </View>
      <Text style={[
        styles.label,
        isLarge ? styles.labelLarge : styles.labelSmall,
        selected && styles.selectedLabel,
      ]}>
        {categoryInfo.name.split(' ')[0].toUpperCase()}
      </Text>
      {suggested && !selected && (
        <View style={styles.suggestedBadge}>
          <Text style={styles.suggestedText}>AI</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerLarge: {
    width: 100,
    height: 90,
    padding: 12,
  },
  containerSmall: {
    width: 80,
    height: 70,
    padding: 8,
  },
  selectedContainer: {
    backgroundColor: '#0D5D56',
    borderColor: '#0D5D56',
  },
  iconWrapper: {
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconWrapperLarge: {
    width: 44,
    height: 44,
  },
  iconWrapperSmall: {
    width: 36,
    height: 36,
  },
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
  labelLarge: {
    fontSize: 12,
    color: '#4B5563',
  },
  labelSmall: {
    fontSize: 10,
    color: '#4B5563',
  },
  selectedLabel: {
    color: '#FFFFFF',
  },
  suggestedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggestedText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

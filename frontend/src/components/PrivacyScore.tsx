import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PrivacyScoreProps {
  score: number;
}

export const PrivacyScore: React.FC<PrivacyScoreProps> = ({ score }) => {
  const getScoreLabel = () => {
    if (score >= 90) return 'EXCELLENT';
    if (score >= 70) return 'GOOD';
    if (score >= 50) return 'FAIR';
    return 'NEEDS ATTENTION';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Privacy Score</Text>
        <Text style={styles.subtitle}>Your data remains 100% on-device.</Text>
      </View>
      <View style={styles.scoreRow}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>{getScoreLabel()}</Text>
      </View>
      <View style={styles.shieldContainer}>
        <Ionicons name="shield-checkmark" size={48} color="rgba(255,255,255,0.3)" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0D5D56',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 12,
  },
  shieldContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

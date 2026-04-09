import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { generateInsights, AIInsight, getBasicInsights } from '../services/aiInsights';

interface Props {
  transactions: Transaction[];
  apiKey?: string;
}

export const InsightsCard: React.FC<Props> = ({ transactions, apiKey }) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInsights();
  }, [transactions, apiKey]);

  const loadInsights = async () => {
    if (transactions.length === 0) {
      setInsights([]);
      return;
    }

    if (apiKey) {
      setLoading(true);
      const result = await generateInsights(transactions, apiKey);
      setInsights(result);
      setLoading(false);
    } else {
      setInsights(getBasicInsights(transactions));
    }
  };

  if (insights.length === 0 && !loading) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return 'alert-circle';
      case 'tip': return 'bulb';
      default: return 'information-circle';
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'tip': return '#059669';
      default: return '#3b82f6';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Insights</Text>
      
      {loading ? (
        <ActivityIndicator size="small" color="#888" style={{ padding: 20 }} />
      ) : (
        insights.map((insight, i) => (
          <View key={i} style={styles.insight}>
            <View style={[styles.iconWrap, { backgroundColor: getColor(insight.type) + '15' }]}>
              <Ionicons name={getIcon(insight.type) as any} size={18} color={getColor(insight.type)} />
            </View>
            <View style={styles.content}>
              <Text style={styles.insightTitle}>{insight.title}</Text>
              <Text style={styles.insightDesc}>{insight.description}</Text>
            </View>
          </View>
        ))
      )}
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
    marginBottom: 12,
  },
  insight: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  insightDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
});

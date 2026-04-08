import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { TransactionProvider } from '../../src/context/TransactionContext';

const TabIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const iconName = focused ? name : `${name}-outline`;
  return (
    <View style={focused ? styles.activeTab : undefined}>
      <Ionicons name={iconName as any} size={24} color={color} />
    </View>
  );
};

export default function TabLayout() {
  const renderVaultIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <TabIcon name="wallet" focused={focused} color={color} />
  ), []);

  const renderActivityIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <TabIcon name="receipt" focused={focused} color={color} />
  ), []);

  const renderAnalysisIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <TabIcon name="bar-chart" focused={focused} color={color} />
  ), []);

  const renderPrivacyIcon = useCallback(({ color, focused }: { color: string; focused: boolean }) => (
    <TabIcon name="shield-checkmark" focused={focused} color={color} />
  ), []);

  return (
    <TransactionProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#0D5D56',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            elevation: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            height: Platform.OS === 'ios' ? 88 : 70,
            paddingBottom: Platform.OS === 'ios' ? 28 : 12,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'VAULT',
            tabBarIcon: renderVaultIcon,
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'ACTIVITY',
            tabBarIcon: renderActivityIcon,
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            title: 'ANALYSIS',
            tabBarIcon: renderAnalysisIcon,
          }}
        />
        <Tabs.Screen
          name="privacy"
          options={{
            title: 'PRIVACY',
            tabBarIcon: renderPrivacyIcon,
          }}
        />
      </Tabs>
    </TransactionProvider>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: '#E8F5F3',
    padding: 8,
    borderRadius: 12,
  },
});

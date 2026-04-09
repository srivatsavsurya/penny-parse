import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { AppProvider } from '../../src/context/AppContext';

export default function TabLayout() {
  const renderIcon = useCallback((name: string, focused: boolean, color: string) => (
    <Ionicons name={(focused ? name : `${name}-outline`) as any} size={22} color={color} />
  ), []);

  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#1a1a1a',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            height: Platform.OS === 'ios' ? 85 : 60,
            paddingBottom: Platform.OS === 'ios' ? 28 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => renderIcon('home', focused, color),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color, focused }) => renderIcon('list', focused, color),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => renderIcon('analytics', focused, color),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => renderIcon('cog', focused, color),
          }}
        />
      </Tabs>
    </AppProvider>
  );
}

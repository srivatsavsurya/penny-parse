import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '../src/context/AppContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { TransactionEditor } from '../src/components/TransactionEditor';
import { useNotificationListener } from '../src/hooks/useNotificationListener';

function RouterGate({ children }: { children: React.ReactNode }) {
  const { settings, ready } = useApp();
  const segments = useSegments();
  const router = useRouter();

  // Wire native notification listener once
  useNotificationListener();

  useEffect(() => {
    if (!ready) return;
    const inOnboarding = (segments[0] as string) === 'onboarding';
    if (!settings.hasOnboarded && !inOnboarding) {
      router.replace('/onboarding' as any);
    } else if (settings.hasOnboarded && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [ready, settings.hasOnboarded, segments]);

  return <>{children}</>;
}

function ThemedShell() {
  const { isDark, colors } = useTheme();
  return (
    <RouterGate>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
          <Stack.Screen name="categories" options={{ presentation: 'modal' }} />
        </Stack>
        <TransactionEditor />
      </View>
    </RouterGate>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <ThemeProvider>
            <ThemedShell />
          </ThemeProvider>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

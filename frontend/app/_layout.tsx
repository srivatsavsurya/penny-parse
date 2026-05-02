import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useApp } from '../src/context/AppContext';
import { TransactionBanner } from '../src/components/TransactionBanner';

function BannerGateway() {
  const { pendingTransaction, confirmTransaction, dismissTransaction } = useApp();
  if (!pendingTransaction) return null;
  return (
    <TransactionBanner
      visible={!!pendingTransaction}
      amount={pendingTransaction.amount}
      merchant={pendingTransaction.merchant}
      isDebit={pendingTransaction.isDebit}
      time={pendingTransaction.time}
      onConfirm={(cat) => confirmTransaction(cat)}
      onDismiss={dismissTransaction}
    />
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <View style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
            </Stack>
            <BannerGateway />
          </View>
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

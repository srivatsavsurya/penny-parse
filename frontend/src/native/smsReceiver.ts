// Native SMS Receiver for Android
// This module structure is for use with expo-dev-client / bare workflow
// When built as APK, this will enable background SMS detection

import { Platform, NativeModules, NativeEventEmitter, AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ParsedSMS } from '../types';
import { parseUPISMS } from '../utils/smartRules';

// Configure notifications to show when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () =>
    ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    } as any),
});

export interface SMSMessage {
  id: string;
  address: string;
  body: string;
  date: number;
}

type SMSCallback = (sms: ParsedSMS) => void;

class SMSReceiverModule {
  private listeners: SMSCallback[] = [];
  private notificationListener: any = null;
  private responseListener: any = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('upi-transactions', {
        name: 'UPI Transactions',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }

    // Listen for notification responses (when user taps notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'upi_transaction' && data?.parsedSMS) {
        this.notifyListeners(data.parsedSMS as ParsedSMS);
      }
    });

    this.isInitialized = true;
  }

  // Request Android SMS permissions
  async requestSMSPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('SMS reading only available on Android');
      return false;
    }

    // In real native implementation, this would request:
    // - android.permission.RECEIVE_SMS
    // - android.permission.READ_SMS
    // For now, we return true and rely on notification-based flow
    
    console.log('SMS permissions would be requested via native module');
    return true;
  }

  // Check if SMS permissions are granted
  async checkSMSPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    // Would check actual permissions in native module
    return true;
  }

  // Register callback for when SMS is detected
  addListener(callback: SMSCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(sms: ParsedSMS): void {
    this.listeners.forEach(cb => cb(sms));
  }

  // Show notification for detected UPI transaction
  // This is called from native SMS receiver or can be triggered manually
  async showTransactionNotification(parsed: ParsedSMS): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `₹${parsed.amount.toLocaleString('en-IN')} ${parsed.isDebit ? 'spent' : 'received'}`,
        body: `${parsed.merchant} - Tap to categorize`,
        data: {
          type: 'upi_transaction',
          parsedSMS: parsed,
        },
        categoryIdentifier: 'upi_transaction',
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  // Simulate SMS detection (for testing)
  async simulateSMS(message: string): Promise<void> {
    const parsed = parseUPISMS(message);
    if (parsed) {
      // Show notification
      await this.showTransactionNotification(parsed);
      // Also notify listeners directly if app is open
      this.notifyListeners(parsed);
    }
  }

  // Process incoming SMS (called from native receiver)
  async processSMS(address: string, body: string): Promise<void> {
    // Check if it's from a bank
    const bankSenders = [
      'HDFCBK', 'SBIINB', 'ICICIB', 'AXISBK', 'KOTAKB', 
      'PNBSMS', 'BOBSMS', 'UNIONB', 'IABORB', 'CANBNK',
      'YESBNK', 'IABORB', 'SCBANK', 'INDUSB', 'FEDBNK'
    ];
    
    const isBankSMS = bankSenders.some(sender => 
      address.toUpperCase().includes(sender)
    );

    if (!isBankSMS) return;

    const parsed = parseUPISMS(body);
    if (parsed) {
      await this.showTransactionNotification(parsed);
      
      // If app is in foreground, also notify directly
      if (AppState.currentState === 'active') {
        this.notifyListeners(parsed);
      }
    }
  }

  cleanup(): void {
    if (this.responseListener && typeof this.responseListener.remove === 'function') {
      this.responseListener.remove();
    }
    this.listeners = [];
  }
}

export const smsReceiver = new SMSReceiverModule();

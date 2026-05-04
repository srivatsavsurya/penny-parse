import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as IntentLauncher from 'expo-intent-launcher';

export interface CapturePayload {
  amount: number;
  merchant: string;
  isDebit: boolean;
  time: number;
  source?: string;
}

export async function openNotificationSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await IntentLauncher.startActivityAsync('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
  } catch (e) {
    console.warn('Failed to open notification settings', e);
  }
}

export async function isPermissionGranted(): Promise<boolean> {
  // No native bridge currently — assume false; rely on user action + the real signal
  // (a deep-link arriving when a UPI notification is captured).
  return false;
}

export const isAvailable = Platform.OS === 'android';

export function parseCaptureUrl(url: string): CapturePayload | null {
  try {
    const parsed = Linking.parse(url);
    if (parsed.hostname !== 'capture') return null;
    const q = parsed.queryParams || {};
    const amount = parseFloat(String(q.amount || '0'));
    const merchant = String(q.merchant || 'Unknown');
    const isDebit = String(q.isDebit) === '1';
    const time = parseInt(String(q.time || Date.now()), 10);
    const source = q.source ? String(q.source) : undefined;
    if (amount <= 0) return null;
    return { amount, merchant, isDebit, time, source };
  } catch {
    return null;
  }
}

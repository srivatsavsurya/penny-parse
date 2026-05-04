import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useApp } from '../context/AppContext';
import { parseCaptureUrl } from '../native/notificationListener';
import { ParsedSMS } from '../types';

/**
 * Listens for the deep link emitted by the native NotificationListenerService
 * when a UPI payment is captured (privateledger://capture?...) and triggers
 * the categorize popup.
 */
export function useNotificationListener() {
  const { triggerParsedSMS } = useApp();

  useEffect(() => {
    const handle = (url: string) => {
      const payload = parseCaptureUrl(url);
      if (!payload) return;
      const dt = new Date(payload.time || Date.now());
      const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      const parsed: ParsedSMS = {
        amount: payload.amount,
        merchant: payload.merchant,
        isDebit: payload.isDebit,
        time,
        rawMessage: '',
        senderId: payload.source,
      };
      triggerParsedSMS(parsed);
    };

    const sub = Linking.addEventListener('url', ({ url }) => handle(url));
    Linking.getInitialURL().then((url) => { if (url) handle(url); });
    return () => sub.remove();
  }, [triggerParsedSMS]);
}

export { isPermissionGranted, openNotificationSettings, isAvailable } from '../native/notificationListener';

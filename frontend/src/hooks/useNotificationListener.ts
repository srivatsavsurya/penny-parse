import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useApp } from '../context/AppContext';
import { parseUPIMessage } from '../utils/upiParser';
import * as NotifListener from '../../modules/notification-listener';

/**
 * Wires the native NotificationListenerService events to the app's banner trigger.
 * Real UPI app notifications (PhonePe / GPay / Paytm / banks) flow through here
 * and pop up the categorize banner.
 */
export function useNotificationListener() {
  const { triggerParsedSMS, settings } = useApp();

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (!NotifListener.isAvailable) return;

    const subscription = NotifListener.addNotificationListener((event) => {
      const text = [event.title, event.text, event.bigText].filter(Boolean).join(' ');
      const parsed = parseUPIMessage(text, event.appName || event.packageName);
      if (parsed) {
        // Override the auto-extracted time with the actual notification post time
        const dt = new Date(event.postTime || Date.now());
        const time = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        triggerParsedSMS({ ...parsed, time, senderId: event.appName });
      }
    });

    return () => {
      try { (subscription as any).remove?.(); } catch {}
    };
  }, [triggerParsedSMS, settings.autoCategorizeSms]);
}

export { isPermissionGranted, openNotificationSettings, isAvailable } from '../../modules/notification-listener';

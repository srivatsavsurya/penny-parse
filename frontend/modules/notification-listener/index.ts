import { EventSubscription, requireNativeModule } from 'expo-modules-core';

export interface UpiNotificationEvent {
  packageName: string;
  appName: string;
  title: string;
  text: string;
  bigText: string;
  postTime: number;
}

interface NativeModule {
  isPermissionGranted(): Promise<boolean>;
  openSettings(): Promise<void>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

// Try to require the native module — may not exist on web/Expo Go
let nativeModule: NativeModule | null = null;
try {
  nativeModule = requireNativeModule('PrivateLedgerNotificationListener');
} catch {
  nativeModule = null;
}

export async function isPermissionGranted(): Promise<boolean> {
  if (!nativeModule) return false;
  try {
    return await nativeModule.isPermissionGranted();
  } catch {
    return false;
  }
}

export async function openNotificationSettings(): Promise<void> {
  if (!nativeModule) return;
  try {
    await nativeModule.openSettings();
  } catch {}
}

export function addNotificationListener(
  callback: (event: UpiNotificationEvent) => void
): EventSubscription | { remove: () => void } {
  if (!nativeModule) return { remove: () => {} };
  // expo-modules-core auto-creates the EventEmitter on the native module
  const emitter = (nativeModule as any);
  if (typeof emitter.addListener === 'function') {
    // SDK 53+: Module is also an EventEmitter
    const sub = emitter.addListener('onNotificationReceived', callback);
    return sub;
  }
  return { remove: () => {} };
}

export const isAvailable = nativeModule !== null;

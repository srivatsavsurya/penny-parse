// Native SMS Module Interface
// This module provides SMS reading capabilities on Android
// For actual native implementation, you'll need to eject to bare workflow
// or use expo-dev-client with a custom native module

import { Platform } from 'react-native';
import { ParsedSMS } from '../types';
import { parseUPISMS } from '../utils/smartRules';

export interface SMSMessage {
  id: string;
  address: string;
  body: string;
  date: number;
  read: boolean;
}

// Mock SMS listener for development/web
// In production Android build, this would use native module
class SMSModule {
  private listeners: ((sms: ParsedSMS) => void)[] = [];
  private isListening = false;

  async requestPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      console.log('SMS permissions only available on Android');
      return false;
    }
    
    // In real implementation, this would request Android permissions
    // For now, return true for demo purposes
    console.log('SMS permissions would be requested here');
    return true;
  }

  async checkPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    // Would check actual permissions in native module
    return true;
  }

  startListening(callback: (sms: ParsedSMS) => void): void {
    this.listeners.push(callback);
    this.isListening = true;
    console.log('SMS listener started');
  }

  stopListening(): void {
    this.listeners = [];
    this.isListening = false;
    console.log('SMS listener stopped');
  }

  // For testing: simulate receiving an SMS
  simulateSMS(message: string): void {
    const parsed = parseUPISMS(message);
    if (parsed) {
      this.listeners.forEach(cb => cb(parsed));
    }
  }

  async getRecentSMS(count: number = 50): Promise<SMSMessage[]> {
    if (Platform.OS !== 'android') return [];
    
    // In real implementation, this would fetch from native module
    // Return empty for now
    return [];
  }

  // Parse SMS messages and extract UPI transactions
  parseMessages(messages: SMSMessage[]): ParsedSMS[] {
    const parsed: ParsedSMS[] = [];
    
    for (const msg of messages) {
      // Only process messages from known bank senders
      const bankSenders = ['HDFCBK', 'SBIINB', 'ICICIB', 'AXISBK', 'KOTAKB', 'PNBSMS', 'BOBSMS', 'UNIONB', 'IABORB', 'CANBNK'];
      const isBankSMS = bankSenders.some(sender => 
        msg.address.toUpperCase().includes(sender)
      );
      
      if (isBankSMS) {
        const result = parseUPISMS(msg.body);
        if (result) {
          parsed.push(result);
        }
      }
    }
    
    return parsed;
  }
}

export const smsModule = new SMSModule();

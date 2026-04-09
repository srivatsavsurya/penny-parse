package com.privateledger.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * Native Android SMS Receiver
 * 
 * This BroadcastReceiver listens for incoming SMS messages and forwards
 * bank/UPI messages to the React Native layer.
 * 
 * To use this:
 * 1. Build with EAS Build (eas build --platform android)
 * 2. Register this receiver in AndroidManifest.xml
 * 3. Request SMS permissions at runtime
 * 
 * This file serves as documentation/template for native implementation.
 * Place in android/app/src/main/java/com/privateledger/app/
 */
public class SMSReceiver extends BroadcastReceiver {
    private static final String TAG = "SMSReceiver";
    private static final String SMS_RECEIVED = "android.provider.Telephony.SMS_RECEIVED";
    
    // Known bank sender IDs
    private static final String[] BANK_SENDERS = {
        "HDFCBK", "SBIINB", "ICICIB", "AXISBK", "KOTAKB",
        "PNBSMS", "BOBSMS", "UNIONB", "IABORB", "CANBNK",
        "YESBNK", "SCBANK", "INDUSB", "FEDBNK"
    };

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!SMS_RECEIVED.equals(intent.getAction())) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        Object[] pdus = (Object[]) bundle.get("pdus");
        if (pdus == null) return;

        for (Object pdu : pdus) {
            SmsMessage sms = SmsMessage.createFromPdu((byte[]) pdu);
            String sender = sms.getOriginatingAddress();
            String body = sms.getMessageBody();

            if (isBankSMS(sender)) {
                Log.d(TAG, "Bank SMS detected from: " + sender);
                sendToReactNative(context, sender, body);
            }
        }
    }

    private boolean isBankSMS(String sender) {
        if (sender == null) return false;
        String upperSender = sender.toUpperCase();
        for (String bankId : BANK_SENDERS) {
            if (upperSender.contains(bankId)) {
                return true;
            }
        }
        return false;
    }

    private void sendToReactNative(Context context, String sender, String body) {
        // This would emit an event to React Native
        // Implementation depends on how you set up the native module
        
        // Option 1: Use a static reference to ReactApplicationContext
        // Option 2: Use a Headless JS task
        // Option 3: Store in SharedPreferences and read on app open
        
        Log.d(TAG, "Would send to RN - Sender: " + sender + ", Body: " + body);
    }
}

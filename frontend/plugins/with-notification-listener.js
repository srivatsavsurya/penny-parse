// Config plugin: registers a NotificationListenerService on Android.
// Listens to UPI/bank app notifications and posts a heads-up notification
// with a deep link back into the app for instant categorization.
const { withAndroidManifest, withDangerousMod, AndroidConfig } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const KOTLIN_TEMPLATE = `package __PACKAGE__

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import androidx.core.app.NotificationCompat

class PLNotificationListenerService : NotificationListenerService() {
  companion object {
    const val CHANNEL_ID = "pl_capture"
    private const val TAG = "PLListener"

    private val PAYMENT_PACKAGES = setOf(
      "com.google.android.apps.nbu.paisa.user",
      "com.phonepe.app",
      "com.phonepe.app.preprod",
      "net.one97.paytm",
      "in.org.npci.upiapp",
      "com.amazon.mShop.android.shopping",
      "in.amazon.mShop.android.shopping",
      "com.amazon.amazonpay.app",
      "com.csam.icici.bank.imobile",
      "com.snapwork.hdfc",
      "com.sbi.lotusintouch",
      "com.sbi.SBIFreedomPlus",
      "com.axis.mobile",
      "com.kotak.bank.kmbl",
      "com.bankofbaroda.upi",
      "com.fss.pnbpsp",
      "com.canarabank.mobility",
      "com.unionbank.ecommerce.mobile.legacy",
      "com.yesbank.mobilebanking",
      "com.idfcfirstbank.optimus",
      "com.fss.indus",
      "com.mobikwik_new",
      "com.freecharge.android",
      "com.cred.android",
      "com.dreamplug.androidapp"
    )

    private val MESSAGING_PACKAGES = setOf(
      "com.google.android.apps.messaging",
      "com.android.mms",
      "com.samsung.android.messaging",
      "com.android.messaging"
    )

    private val DEBIT_REGEX = listOf(
      Regex("(?:Rs\\\\.?|INR|\u20B9)\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)\\\\s*(?:has been |is |)(?:debited|deducted|paid|sent|transferred).*?(?:to|for|@)\\\\s*([\\\\w\\\\s@.\\\\-]+?)(?:\\\\s+on|\\\\s+Ref|\\\\s+UPI|\\\\.|$)", RegexOption.IGNORE_CASE),
      Regex("(?:sent|paid|transferred)\\\\s*(?:Rs\\\\.?|INR|\u20B9)?\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)\\\\s*to\\\\s*([\\\\w\\\\s@.\\\\-]+?)(?:\\\\s+on|\\\\s+via|\\\\s+Ref|\\\\.|$)", RegexOption.IGNORE_CASE),
      Regex("(?:Rs\\\\.?|INR|\u20B9)\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)\\\\s*(?:sent|paid|debited|transferred)\\\\s*(?:to|for)\\\\s*([\\\\w\\\\s@.\\\\-]+?)(?:\\\\s+on|\\\\s+Ref|\\\\.|$)", RegexOption.IGNORE_CASE)
    )
    private val CREDIT_REGEX = listOf(
      Regex("(?:Rs\\\\.?|INR|\u20B9)\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)\\\\s*(?:has been |is |)(?:credited|received|deposited).*?(?:from|by)\\\\s*([\\\\w\\\\s@.\\\\-]+?)(?:\\\\s+on|\\\\s+Ref|\\\\.|$)", RegexOption.IGNORE_CASE),
      Regex("(?:received|got)\\\\s*(?:Rs\\\\.?|INR|\u20B9)?\\\\s*([\\\\d,]+(?:\\\\.\\\\d{1,2})?)\\\\s*from\\\\s*([\\\\w\\\\s@.\\\\-]+?)(?:\\\\s+on|\\\\s+Ref|\\\\.|$)", RegexOption.IGNORE_CASE)
    )
  }

  override fun onListenerConnected() {
    super.onListenerConnected()
    createChannel()
    Log.d(TAG, "Connected")
  }

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
      if (nm.getNotificationChannel(CHANNEL_ID) == null) {
        val ch = NotificationChannel(CHANNEL_ID, "Categorize UPI", NotificationManager.IMPORTANCE_HIGH)
        ch.description = "Quickly categorize each UPI payment"
        ch.enableLights(true)
        ch.enableVibration(true)
        nm.createNotificationChannel(ch)
      }
    }
  }

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    try {
      val pkg = sbn.packageName ?: return
      val isPay = pkg in PAYMENT_PACKAGES
      val isMsg = pkg in MESSAGING_PACKAGES
      if (!isPay && !isMsg) return

      val ex = sbn.notification.extras
      val title = ex.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
      val text = ex.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
      val big = ex.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
      val combined = "$title $text $big"

      if (isMsg) {
        val low = combined.lowercase()
        val keys = listOf("upi", "debited", "credited", "a/c", "acct", "account", "payment", "\u20b9", "inr ", "rs.", "rs ")
        if (keys.none { low.contains(it) }) return
      }

      val (amount, merchant, isDebit) = parseUpi(combined) ?: return
      val appName = try { packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString() } catch (e: Exception) { pkg }

      Log.d(TAG, "Captured $pkg: $amount to $merchant")
      postCategorizeNotification(amount, merchant, isDebit, appName)
    } catch (e: Exception) {
      Log.e(TAG, "err", e)
    }
  }

  private fun parseUpi(msg: String): Triple<Double, String, Boolean>? {
    for (rx in DEBIT_REGEX) {
      rx.find(msg)?.let { m ->
        val amt = m.groupValues[1].replace(",", "").toDoubleOrNull() ?: return@let
        val mer = cleanMerchant(m.groupValues[2])
        return Triple(amt, mer, true)
      }
    }
    for (rx in CREDIT_REGEX) {
      rx.find(msg)?.let { m ->
        val amt = m.groupValues[1].replace(",", "").toDoubleOrNull() ?: return@let
        val mer = cleanMerchant(m.groupValues[2])
        return Triple(amt, mer, false)
      }
    }
    return null
  }

  private fun cleanMerchant(raw: String): String {
    var s = raw.trim().replace(Regex("@[\\\\w.]+$", RegexOption.IGNORE_CASE), "")
    s = s.replace(Regex("\\\\s*(pvt|ltd|llp|private|limited|india|pay|upi)\\\\s*", RegexOption.IGNORE_CASE), " ")
    s = s.replace(Regex("\\\\s+"), " ").trim()
    return if (s.isEmpty()) "Unknown" else s.split(" ").joinToString(" ") { it.replaceFirstChar { c -> c.titlecase() } }
  }

  private fun postCategorizeNotification(amount: Double, merchant: String, isDebit: Boolean, appName: String) {
    val time = System.currentTimeMillis()
    val uri = Uri.Builder()
      .scheme("privateledger")
      .authority("capture")
      .appendQueryParameter("amount", amount.toString())
      .appendQueryParameter("merchant", merchant)
      .appendQueryParameter("isDebit", if (isDebit) "1" else "0")
      .appendQueryParameter("time", time.toString())
      .appendQueryParameter("source", appName)
      .build()

    val intent = Intent(Intent.ACTION_VIEW, uri).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
      setPackage(packageName)
    }
    val pi = PendingIntent.getActivity(
      this, time.toInt(), intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    val sign = if (isDebit) "\u2212" else "+"
    val amountStr = if (amount % 1.0 == 0.0) amount.toLong().toString() else String.format("%.2f", amount)

    val notif = NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(android.R.drawable.ic_menu_edit)
      .setContentTitle("$sign\u20B9$amountStr  \u00b7  $merchant")
      .setContentText("Tap to categorize")
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_RECOMMENDATION)
      .setColor(if (isDebit) 0xFFEF4444.toInt() else 0xFF10B981.toInt())
      .setContentIntent(pi)
      .setAutoCancel(true)
      .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
      .build()

    val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
    nm.notify(time.toInt(), notif)
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification) {}
}
`;

function addServiceToManifest(config) {
  return withAndroidManifest(config, async (config) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(config.modResults);
    application.service = application.service || [];
    const exists = application.service.some(
      (s) => s.$ && s.$['android:name'] && s.$['android:name'].includes('PLNotificationListenerService')
    );
    if (!exists) {
      application.service.push({
        $: {
          'android:name': '.PLNotificationListenerService',
          'android:exported': 'true',
          'android:permission': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
          'android:label': 'Private Ledger',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.service.notification.NotificationListenerService' } }],
          },
        ],
      });
    }

    config.modResults.manifest['uses-permission'] = config.modResults.manifest['uses-permission'] || [];
    const hasPerm = config.modResults.manifest['uses-permission'].some(
      (p) => p.$ && p.$['android:name'] === 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE'
    );
    if (!hasPerm) {
      config.modResults.manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE' },
      });
    }
    return config;
  });
}

function writeKotlinFile(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const pkg = config.android && config.android.package;
      if (!pkg) throw new Error('android.package is not set in app.json');
      const javaDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'java',
        ...pkg.split('.')
      );
      fs.mkdirSync(javaDir, { recursive: true });
      const target = path.join(javaDir, 'PLNotificationListenerService.kt');
      const source = KOTLIN_TEMPLATE.replace(/__PACKAGE__/g, pkg);
      fs.writeFileSync(target, source, 'utf8');
      return config;
    },
  ]);
}

module.exports = function withNotificationListener(config) {
  config = addServiceToManifest(config);
  config = writeKotlinFile(config);
  return config;
};

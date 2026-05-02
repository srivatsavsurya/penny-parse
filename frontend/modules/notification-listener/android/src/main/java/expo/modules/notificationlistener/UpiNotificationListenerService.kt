package expo.modules.notificationlistener

import android.app.Notification
import android.content.pm.PackageManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

class UpiNotificationListenerService : NotificationListenerService() {
  companion object {
    private const val TAG = "PLNotifListener"

    // Whitelist of UPI / banking apps to monitor
    private val PAYMENT_PACKAGES = setOf(
      "com.google.android.apps.nbu.paisa.user", // GPay
      "com.phonepe.app", // PhonePe
      "com.phonepe.app.preprod",
      "net.one97.paytm", // Paytm
      "in.org.npci.upiapp", // BHIM
      "com.amazon.mShop.android.shopping", // Amazon Pay context
      "com.amazon.amazonpay.app", // Amazon Pay
      "in.amazon.mShop.android.shopping",
      "com.csam.icici.bank.imobile", // ICICI iMobile
      "com.snapwork.hdfc", // HDFC
      "com.sbi.lotusintouch", // SBI
      "com.sbi.SBIFreedomPlus",
      "com.axis.mobile", // Axis
      "com.kotak.bank.kmbl", // Kotak
      "com.bankofbaroda.upi", // BOB
      "com.fss.pnbpsp", // PNB
      "com.canarabank.mobility", // Canara
      "com.unionbank.ecommerce.mobile.legacy", // Union
      "com.yesbank.mobilebanking", // Yes
      "com.idfcfirstbank.optimus", // IDFC
      "com.fss.indus", // IndusInd
      "com.mobikwik_new", // Mobikwik
      "com.freecharge.android", // Freecharge
      "com.cred.android", // CRED
      "com.dreamplug.androidapp",
      "com.facebook.orca" // (test - remove)
    )

    // Generic SMS app package (for fallback bank SMS)
    private val MESSAGING_PACKAGES = setOf(
      "com.google.android.apps.messaging",
      "com.android.mms",
      "com.samsung.android.messaging",
      "com.android.messaging"
    )
  }

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    try {
      val packageName = sbn.packageName ?: return
      val isPaymentApp = packageName in PAYMENT_PACKAGES
      val isMessagingApp = packageName in MESSAGING_PACKAGES
      if (!isPaymentApp && !isMessagingApp) return

      val extras = sbn.notification.extras
      val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString() ?: ""
      val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
      val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: ""
      val combined = listOf(title, text, bigText).joinToString(" ").lowercase()

      // For messaging apps, only forward if it looks like a UPI/bank SMS
      if (isMessagingApp) {
        val keywords = listOf(
          "upi", "debited", "credited", "a/c", "acct", "account",
          "payment", "transferred", "received rs", "sent rs", "paid rs",
          "\u20b9", "inr ", "rs.", "rs "
        )
        if (keywords.none { combined.contains(it) }) return
      }

      val appName = try {
        val pm = packageManager
        val ai = pm.getApplicationInfo(packageName, 0)
        pm.getApplicationLabel(ai).toString()
      } catch (_: PackageManager.NameNotFoundException) {
        packageName
      }

      Log.d(TAG, "Forwarding $packageName: $title / $text")
      NotificationListenerModule.instance?.emitNotification(
        packageName, appName, title, text, bigText, sbn.postTime
      )
    } catch (e: Exception) {
      Log.e(TAG, "Error processing notification", e)
    }
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification) {
    // no-op
  }

  override fun onListenerConnected() {
    super.onListenerConnected()
    Log.d(TAG, "NotificationListenerService connected")
  }

  override fun onListenerDisconnected() {
    super.onListenerDisconnected()
    Log.d(TAG, "NotificationListenerService disconnected")
  }
}

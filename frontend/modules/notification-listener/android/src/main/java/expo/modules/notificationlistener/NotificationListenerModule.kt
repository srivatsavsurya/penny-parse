package expo.modules.notificationlistener

import android.content.Intent
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NotificationListenerModule : Module() {
  companion object {
    @Volatile
    var instance: NotificationListenerModule? = null
  }

  override fun definition() = ModuleDefinition {
    Name("PrivateLedgerNotificationListener")

    Events("onNotificationReceived")

    OnCreate {
      instance = this@NotificationListenerModule
    }

    OnDestroy {
      instance = null
    }

    AsyncFunction("isPermissionGranted") {
      val ctx = appContext.reactContext ?: return@AsyncFunction false
      val pkg = ctx.packageName
      val flat = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
      flat != null && flat.contains(pkg)
    }

    AsyncFunction("openSettings") {
      val ctx = appContext.reactContext ?: return@AsyncFunction
      val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      ctx.startActivity(intent)
    }
  }

  fun emitNotification(
    packageName: String,
    appName: String,
    title: String,
    text: String,
    bigText: String,
    postTime: Long
  ) {
    try {
      sendEvent(
        "onNotificationReceived",
        mapOf(
          "packageName" to packageName,
          "appName" to appName,
          "title" to title,
          "text" to text,
          "bigText" to bigText,
          "postTime" to postTime
        )
      )
    } catch (_: Exception) {
      // Module not active; ignore
    }
  }
}

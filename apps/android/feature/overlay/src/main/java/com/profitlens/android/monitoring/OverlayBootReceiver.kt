package com.profitlens.android.monitoring

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.work.ExistingWorkPolicy
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager

class OverlayBootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent?.action != Intent.ACTION_BOOT_COMPLETED) {
      return
    }
    WorkManager.getInstance(context).enqueueUniqueWork(
      "overlay-recovery",
      ExistingWorkPolicy.REPLACE,
      OneTimeWorkRequestBuilder<OverlayRecoveryWorker>().build(),
    )
  }
}

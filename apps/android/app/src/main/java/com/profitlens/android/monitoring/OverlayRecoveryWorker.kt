package com.profitlens.android.monitoring

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.profitlens.android.app.ProfitLensApplication

class OverlayRecoveryWorker(
  appContext: Context,
  params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
  override suspend fun doWork(): Result {
    val container = (applicationContext as ProfitLensApplication).container
    container.featureFlagsRepository.fetch()
    return Result.success()
  }
}

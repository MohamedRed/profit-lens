package com.profitlens.android.monitoring

import android.content.Context
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.android.EntryPointAccessors
import dagger.hilt.components.SingletonComponent
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.profitlens.android.data.OverlayFeatureFlagsRepository

class OverlayRecoveryWorker(
  appContext: Context,
  params: WorkerParameters,
) : CoroutineWorker(appContext, params) {
  override suspend fun doWork(): Result {
    val entryPoint = EntryPointAccessors.fromApplication(
      applicationContext,
      OverlayRecoveryWorkerEntryPoint::class.java,
    )
    entryPoint.featureFlagsRepository().fetch()
    return Result.success()
  }
}

@EntryPoint
@InstallIn(SingletonComponent::class)
interface OverlayRecoveryWorkerEntryPoint {
  fun featureFlagsRepository(): OverlayFeatureFlagsRepository
}

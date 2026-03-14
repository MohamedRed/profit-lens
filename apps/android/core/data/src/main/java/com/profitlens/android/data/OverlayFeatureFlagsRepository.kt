package com.profitlens.android.data

import javax.inject.Inject
import javax.inject.Singleton

data class OverlayFeatureFlags(
  val uberEatsEnabled: Boolean,
  val deliverooEnabled: Boolean,
)

@Singleton
class OverlayFeatureFlagsRepository @Inject constructor(
  private val firebaseReady: Boolean,
) {
  suspend fun fetch(): OverlayFeatureFlags {
    if (!firebaseReady) {
      return defaultFlags()
    }
    return defaultFlags()
  }

  fun defaultFlags(): OverlayFeatureFlags {
    return OverlayFeatureFlags(
      uberEatsEnabled = true,
      deliverooEnabled = true,
    )
  }
}

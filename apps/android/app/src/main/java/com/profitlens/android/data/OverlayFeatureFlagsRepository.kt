package com.profitlens.android.data

data class OverlayFeatureFlags(
  val uberEatsEnabled: Boolean,
  val deliverooEnabled: Boolean,
)

class OverlayFeatureFlagsRepository(private val firebaseReady: Boolean) {
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

package com.profitlens.android.data

import com.google.firebase.remoteconfig.FirebaseRemoteConfig
import com.google.firebase.remoteconfig.FirebaseRemoteConfigSettings
import kotlinx.coroutines.tasks.await

data class OverlayFeatureFlags(
  val uberEatsEnabled: Boolean,
  val deliverooEnabled: Boolean,
)

class OverlayFeatureFlagsRepository(private val firebaseReady: Boolean) {
  suspend fun fetch(): OverlayFeatureFlags {
    if (!firebaseReady) {
      return defaultFlags()
    }
    val remoteConfig = FirebaseRemoteConfig.getInstance()
    remoteConfig.setConfigSettingsAsync(
      FirebaseRemoteConfigSettings.Builder()
        .setMinimumFetchIntervalInSeconds(300)
        .build(),
    ).await()
    remoteConfig.setDefaultsAsync(
      mapOf(
        KEY_UBER_EATS to true,
        KEY_DELIVEROO to true,
      ),
    ).await()
    remoteConfig.fetchAndActivate().await()
    return OverlayFeatureFlags(
      uberEatsEnabled = remoteConfig.getBoolean(KEY_UBER_EATS),
      deliverooEnabled = remoteConfig.getBoolean(KEY_DELIVEROO),
    )
  }

  fun defaultFlags(): OverlayFeatureFlags {
    return OverlayFeatureFlags(
      uberEatsEnabled = true,
      deliverooEnabled = true,
    )
  }

  private companion object {
    const val KEY_UBER_EATS = "overlay_provider_uber_eats_enabled"
    const val KEY_DELIVEROO = "overlay_provider_deliveroo_enabled"
  }
}

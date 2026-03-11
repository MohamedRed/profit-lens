package com.profitlens.android.ui

import com.profitlens.android.auth.ProfitLensAuthUser
import com.profitlens.android.data.LiveOfferSessionEntity
import com.profitlens.android.data.OverlayFeatureFlags

data class OverlayMonitorUiState(
  val firebaseReady: Boolean,
  val user: ProfitLensAuthUser?,
  val monitoringEnabled: Boolean,
  val accessibilityEnabled: Boolean,
  val fineLocationGranted: Boolean,
  val backgroundLocationGranted: Boolean,
  val batteryOptimizedIgnored: Boolean,
  val featureFlags: OverlayFeatureFlags,
  val sessions: List<LiveOfferSessionEntity>,
  val message: String?,
  val loading: Boolean,
)

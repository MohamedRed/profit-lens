package com.profitlens.android.ui

import com.profitlens.android.core.data.model.AuthUser
import com.profitlens.android.data.LiveOfferSessionEntity
import com.profitlens.android.data.OverlayFeatureFlags

data class OverlayMonitorUiState(
  val user: AuthUser?,
  val monitoringEnabled: Boolean,
  val accessibilityEnabled: Boolean,
  val fineLocationGranted: Boolean,
  val backgroundLocationGranted: Boolean,
  val batteryOptimizedIgnored: Boolean,
  val featureFlags: OverlayFeatureFlags,
  val sessions: List<LiveOfferSessionEntity>,
  val message: String?,
)

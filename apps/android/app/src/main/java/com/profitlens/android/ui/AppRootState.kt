package com.profitlens.android.ui

import com.profitlens.android.auth.AuthUser
import com.profitlens.android.core.data.model.ActiveDeviceSnapshot

enum class DeviceGateStatus {
  CHECKING,
  READY,
  LIMIT,
  ERROR,
}

data class AppRootState(
  val firebaseReady: Boolean,
  val loading: Boolean,
  val user: AuthUser?,
  val onboardingRequired: Boolean,
  val selectedMainTab: String,
  val currentDeviceId: String?,
  val deviceGateStatus: DeviceGateStatus,
  val deviceGateMessage: String?,
  val activeDevices: List<ActiveDeviceSnapshot>,
  val pendingBillingStatus: String?,
)

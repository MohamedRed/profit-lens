package com.profitlens.android.feature.overlay

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.data.OverlayFeatureFlagsRepository
import com.profitlens.android.data.OverlayMonitoringPreferences
import com.profitlens.android.data.OverlaySessionRepository
import com.profitlens.android.ui.OverlayMonitorUiState
import com.profitlens.android.ui.hasBackgroundLocationPermission
import com.profitlens.android.ui.hasFineLocationPermission
import com.profitlens.android.ui.isAccessibilityServiceEnabled
import com.profitlens.android.ui.isIgnoringBatteryOptimizations
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class OverlayMonitorViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val monitoringPreferences: OverlayMonitoringPreferences,
  sessionRepository: OverlaySessionRepository,
  private val featureFlagsRepository: OverlayFeatureFlagsRepository,
  @ApplicationContext private val context: Context,
) : ViewModel() {
  private val message = MutableStateFlow<String?>(null)
  private val flags = MutableStateFlow(featureFlagsRepository.defaultFlags())

  val uiState = combine(
    authRepository.watchUser(),
    monitoringPreferences.watchEnabled(),
    sessionRepository.watchLatestSessions(),
    message,
    flags,
  ) { user, monitoringEnabled, sessions, currentMessage, currentFlags ->
    OverlayMonitorUiState(
      user = user,
      monitoringEnabled = monitoringEnabled,
      accessibilityEnabled = isAccessibilityServiceEnabled(context),
      fineLocationGranted = hasFineLocationPermission(context),
      backgroundLocationGranted = hasBackgroundLocationPermission(context),
      batteryOptimizedIgnored = isIgnoringBatteryOptimizations(context),
      featureFlags = currentFlags,
      sessions = sessions,
      message = currentMessage,
    )
  }.stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    OverlayMonitorUiState(
      user = null,
      monitoringEnabled = false,
      accessibilityEnabled = false,
      fineLocationGranted = false,
      backgroundLocationGranted = false,
      batteryOptimizedIgnored = false,
      featureFlags = featureFlagsRepository.defaultFlags(),
      sessions = emptyList(),
      message = null,
    ),
  )

  init {
    viewModelScope.launch {
      flags.value = featureFlagsRepository.fetch()
    }
  }

  fun setMonitoringEnabled(enabled: Boolean) {
    monitoringPreferences.setEnabled(enabled)
    message.value = if (enabled) {
      "Overlay monitoring is enabled. Leave courier offers visible so Profit Lens can score them."
    } else {
      "Overlay monitoring is paused."
    }
  }
}

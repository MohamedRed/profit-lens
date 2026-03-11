package com.profitlens.android.ui

import android.app.Application
import android.os.Build
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.app.ProfitLensApplication
import com.profitlens.android.data.OverlayFeatureFlags
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {
  private val container = (application as ProfitLensApplication).container
  private val message = MutableStateFlow<String?>(null)
  private val loading = MutableStateFlow(false)
  private val featureFlags = MutableStateFlow(container.featureFlagsRepository.defaultFlags())

  val uiState = combine(
    container.authRepository.watchUser(),
    container.monitoringPreferences.watchEnabled(),
    container.overlaySessionRepository.watchLatestSessions(),
    message,
    loading,
    featureFlags,
  ) { user, monitoringEnabled, sessions, currentMessage, isLoading, flags ->
    OverlayMonitorUiState(
      firebaseReady = container.firebaseReady,
      user = user,
      monitoringEnabled = monitoringEnabled,
      accessibilityEnabled = isAccessibilityServiceEnabled(getApplication()),
      fineLocationGranted = hasFineLocationPermission(getApplication()),
      backgroundLocationGranted = hasBackgroundLocationPermission(getApplication()),
      batteryOptimizedIgnored = isIgnoringBatteryOptimizations(getApplication()),
      featureFlags = flags,
      sessions = sessions,
      message = currentMessage,
      loading = isLoading,
    )
  }.stateIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5_000),
    initialValue = OverlayMonitorUiState(
      firebaseReady = container.firebaseReady,
      user = null,
      monitoringEnabled = false,
      accessibilityEnabled = false,
      fineLocationGranted = false,
      backgroundLocationGranted = false,
      batteryOptimizedIgnored = false,
      featureFlags = container.featureFlagsRepository.defaultFlags(),
      sessions = emptyList(),
      message = null,
      loading = false,
    ),
  )

  init {
    viewModelScope.launch {
      featureFlags.value = container.featureFlagsRepository.fetch()
    }
  }

  fun signIn(email: String, password: String) {
    loading.value = true
    message.value = null
    viewModelScope.launch {
      runCatching {
        container.authRepository.signIn(email, password)
        container.functionsRepository.registerDevice(
          deviceId = container.deviceIdStore.getOrCreate(),
          userAgent = "android/${Build.VERSION.RELEASE} ${Build.MODEL}",
        )
      }.onSuccess {
        message.value = "Signed in."
      }.onFailure {
        message.value = it.message ?: "Unable to sign in."
      }
      loading.value = false
    }
  }

  fun signOut() {
    viewModelScope.launch {
      container.authRepository.signOut()
      container.monitoringPreferences.setEnabled(false)
      message.value = "Signed out."
    }
  }

  fun setMonitoringEnabled(enabled: Boolean) {
    container.monitoringPreferences.setEnabled(enabled)
  }
}

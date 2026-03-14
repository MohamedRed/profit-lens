package com.profitlens.android.ui

import android.app.Application
import android.os.Build
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.app.ProfitLensApplication
import com.profitlens.android.auth.ProfitLensAuthUser
import com.profitlens.android.data.LiveOfferSessionEntity
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collect
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
  private val workspace = MutableStateFlow(WorkspaceLaunchState.idle())
  private val authUser = container.authRepository.watchUser().stateIn(
    scope = viewModelScope,
    started = SharingStarted.WhileSubscribed(5_000),
    initialValue = null,
  )
  private var workspaceRefreshJob: Job? = null

  val uiState = combine(
    authUser,
    container.monitoringPreferences.watchEnabled(),
    container.overlaySessionRepository.watchLatestSessions(),
    workspace,
    message,
    loading,
    featureFlags,
  ) { values ->
    val user = values[0] as ProfitLensAuthUser?
    val monitoringEnabled = values[1] as Boolean
    @Suppress("UNCHECKED_CAST")
    val sessions = values[2] as List<LiveOfferSessionEntity>
    val workspaceState = values[3] as WorkspaceLaunchState
    val currentMessage = values[4] as String?
    val isLoading = values[5] as Boolean
    val flags = values[6] as com.profitlens.android.data.OverlayFeatureFlags
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
      workspace = workspaceState,
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
      workspace = WorkspaceLaunchState.idle(),
      message = null,
      loading = false,
    ),
  )

  init {
    viewModelScope.launch {
      featureFlags.value = container.featureFlagsRepository.fetch()
    }
    viewModelScope.launch {
      authUser.collect { user ->
        if (user == null) {
          workspaceRefreshJob?.cancel()
          workspace.value = WorkspaceLaunchState.idle()
          return@collect
        }
        if (workspace.value.sessionKey == null && !loading.value) {
          refreshWorkspaceSession()
        }
      }
    }
  }

  fun signIn(email: String, password: String) {
    loading.value = true
    message.value = null
    viewModelScope.launch {
      runCatching {
        container.authRepository.signIn(email, password)
        refreshWorkspaceSession(force = true)
      }.onSuccess {
        message.value = "Signed in."
      }.onFailure {
        message.value = toUserFacingWorkspaceMessage(it)
      }
      loading.value = false
    }
  }

  fun signOut() {
    viewModelScope.launch {
      container.authRepository.signOut()
      container.monitoringPreferences.setEnabled(false)
      workspaceRefreshJob?.cancel()
      workspace.value = WorkspaceLaunchState.idle()
      message.value = "Signed out."
    }
  }

  fun setMonitoringEnabled(enabled: Boolean) {
    container.monitoringPreferences.setEnabled(enabled)
  }

  fun refreshWorkspaceSession(force: Boolean = false) {
    val user = authUser.value ?: return
    if (!force && (workspace.value.loading || workspace.value.ownerUid == user.uid)) {
      return
    }
    workspaceRefreshJob?.cancel()
    workspaceRefreshJob = viewModelScope.launch {
      workspace.value = WorkspaceLaunchState(
        startUrl = null,
        loading = true,
        message = null,
        sessionKey = null,
        ownerUid = user.uid,
      )
      runCatching {
        val deviceId = ensureAndroidDeviceRegistration()
        val session = container.functionsRepository.createAndroidWebSession(deviceId)
        WorkspaceLaunchState(
          startUrl = buildWorkspaceStartUrl(session.customToken),
          loading = false,
          message = null,
          sessionKey = "${user.uid}:${System.currentTimeMillis()}",
          ownerUid = user.uid,
        )
      }.onSuccess {
        workspace.value = it
      }.onFailure {
        workspace.value = WorkspaceLaunchState(
          startUrl = null,
          loading = false,
          message = toUserFacingWorkspaceMessage(it),
          sessionKey = null,
          ownerUid = user.uid,
        )
      }
    }
  }

  fun handleWorkspaceSignedOut() {
    signOut()
  }

  private suspend fun ensureAndroidDeviceRegistration(): String {
    val deviceId = container.deviceIdStore.getOrCreate()
    container.functionsRepository.registerDevice(
      deviceId = deviceId,
      userAgent = "android/${Build.VERSION.RELEASE} ${Build.MODEL}",
    )
    return deviceId
  }
}

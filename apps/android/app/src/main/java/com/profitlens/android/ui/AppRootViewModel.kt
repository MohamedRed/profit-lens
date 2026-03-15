package com.profitlens.android.ui

import android.os.Build
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.functions.FirebaseFunctionsException
import com.profitlens.android.auth.AuthUser
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.apps.AppPreferencesStore
import com.profitlens.android.core.data.apps.PendingBillingReturnRepository
import com.profitlens.android.core.data.repository.DevicesRepository
import com.profitlens.android.core.data.repository.ProfileRepository
import com.profitlens.android.core.data.repository.VehiclesRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

@HiltViewModel
class AppRootViewModel @Inject constructor(
  private val authRepository: AuthRepository,
  private val profileRepository: ProfileRepository,
  private val vehiclesRepository: VehiclesRepository,
  private val devicesRepository: DevicesRepository,
  private val deviceIdStore: ProfitLensDeviceIdStore,
  private val appPreferencesStore: AppPreferencesStore,
  private val pendingBillingReturnRepository: PendingBillingReturnRepository,
  firebaseReady: Boolean,
) : ViewModel() {
  private val currentDeviceId = MutableStateFlow<String?>(null)
  private val deviceGateStatus = MutableStateFlow(DeviceGateStatus.CHECKING)
  private val deviceGateMessage = MutableStateFlow<String?>(null)
  private val activeDevices = MutableStateFlow<List<com.profitlens.android.core.data.model.ActiveDeviceSnapshot>>(emptyList())
  private var registrationJob: Job? = null

  private val authUser = authRepository.watchUser().stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    null,
  )
  private val selectedMainTab = appPreferencesStore.selectedMainTab.stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    "offer",
  )
  private val pendingBillingStatus = pendingBillingReturnRepository.watch().stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    null,
  )
  private val profile = authUser.flatMapLatest { user ->
    user?.let { profileRepository.watchProfile(it.uid, it.email) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val vehicles = authUser.flatMapLatest { user ->
    user?.let { vehiclesRepository.watchVehicles(it.uid) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private data class AppRootSessionSnapshot(
    val user: AuthUser?,
    val profile: com.profitlens.android.core.data.model.UserProfile?,
    val vehicles: List<com.profitlens.android.core.data.model.VehicleProfile>,
    val selectedMainTab: String,
    val pendingBillingStatus: String?,
  )

  private data class AppRootGateSnapshot(
    val currentDeviceId: String?,
    val deviceGateStatus: DeviceGateStatus,
    val deviceGateMessage: String?,
    val activeDevices: List<com.profitlens.android.core.data.model.ActiveDeviceSnapshot>,
  )

  val uiState: StateFlow<AppRootState> = combine(
    combine(authUser, profile, vehicles, selectedMainTab, pendingBillingStatus) { user, currentProfile, currentVehicles, tab, billingStatus ->
      AppRootSessionSnapshot(
        user = user,
        profile = currentProfile,
        vehicles = currentVehicles,
        selectedMainTab = tab,
        pendingBillingStatus = billingStatus,
      )
    },
    combine(currentDeviceId, deviceGateStatus, deviceGateMessage, activeDevices) { deviceId, gateStatus, gateMessage, blockedDevices ->
      AppRootGateSnapshot(
        currentDeviceId = deviceId,
        deviceGateStatus = gateStatus,
        deviceGateMessage = gateMessage,
        activeDevices = blockedDevices,
      )
    },
  ) { sessionSnapshot, gateSnapshot ->
    val onboardingRequired = sessionSnapshot.user != null &&
      gateSnapshot.deviceGateStatus == DeviceGateStatus.READY &&
      !isOnboardingComplete(sessionSnapshot.profile, sessionSnapshot.vehicles)
    AppRootState(
      firebaseReady = firebaseReady,
      loading = sessionSnapshot.user != null && gateSnapshot.deviceGateStatus == DeviceGateStatus.CHECKING,
      user = sessionSnapshot.user,
      onboardingRequired = onboardingRequired,
      selectedMainTab = sessionSnapshot.selectedMainTab,
      currentDeviceId = gateSnapshot.currentDeviceId,
      deviceGateStatus = if (sessionSnapshot.user == null) DeviceGateStatus.READY else gateSnapshot.deviceGateStatus,
      deviceGateMessage = gateSnapshot.deviceGateMessage,
      activeDevices = gateSnapshot.activeDevices,
      pendingBillingStatus = sessionSnapshot.pendingBillingStatus,
    )
  }.stateIn(
    viewModelScope,
    SharingStarted.WhileSubscribed(5_000),
    AppRootState(
      firebaseReady = firebaseReady,
      loading = true,
      user = null,
      onboardingRequired = false,
      selectedMainTab = "offer",
      currentDeviceId = null,
      deviceGateStatus = DeviceGateStatus.CHECKING,
      deviceGateMessage = null,
      activeDevices = emptyList(),
      pendingBillingStatus = null,
    ),
  )

  init {
    viewModelScope.launch {
      currentDeviceId.value = deviceIdStore.getOrCreate()
    }
    viewModelScope.launch {
      authUser.collect { user ->
        registrationJob?.cancel()
        if (user == null) {
          activeDevices.value = emptyList()
          deviceGateMessage.value = null
          deviceGateStatus.value = DeviceGateStatus.READY
          return@collect
        }
        registerDevice(user)
      }
    }
  }

  fun replaceActiveDevice(deviceId: String) {
    val user = authUser.value ?: return
    registerDevice(user, replaceDeviceId = deviceId)
  }

  fun retryDeviceRegistration() {
    authUser.value?.let(::registerDevice)
  }

  fun signOut() {
    viewModelScope.launch {
      authRepository.signOut()
      appPreferencesStore.saveSelectedMainTab("offer")
    }
  }

  fun saveSelectedMainTab(route: String) {
    viewModelScope.launch {
      appPreferencesStore.saveSelectedMainTab(route)
    }
  }

  fun consumePendingBillingStatus() {
    pendingBillingReturnRepository.consume()
  }

  private fun registerDevice(user: AuthUser, replaceDeviceId: String? = null) {
    registrationJob?.cancel()
    registrationJob = viewModelScope.launch {
      val deviceId = currentDeviceId.value ?: deviceIdStore.getOrCreate().also { currentDeviceId.value = it }
      deviceGateStatus.value = DeviceGateStatus.CHECKING
      deviceGateMessage.value = null
      runCatching {
        devicesRepository.registerDevice(
          deviceId = deviceId,
          userAgent = "android/${Build.VERSION.RELEASE} ${Build.MODEL}",
          replaceDeviceId = replaceDeviceId,
        )
      }.onSuccess {
        activeDevices.value = emptyList()
        deviceGateStatus.value = DeviceGateStatus.READY
      }.onFailure { error ->
        val blockedDevices = devicesRepository.parseActiveDevices(error)
        if (blockedDevices.isNotEmpty()) {
          activeDevices.value = blockedDevices
          deviceGateStatus.value = DeviceGateStatus.LIMIT
          deviceGateMessage.value = "Your plan already has an active device. Replace one below to continue."
        } else {
          deviceGateStatus.value = DeviceGateStatus.ERROR
          deviceGateMessage.value = when ((error as? FirebaseFunctionsException)?.code) {
            FirebaseFunctionsException.Code.UNAVAILABLE,
            FirebaseFunctionsException.Code.DEADLINE_EXCEEDED,
            FirebaseFunctionsException.Code.INTERNAL,
            FirebaseFunctionsException.Code.UNKNOWN -> "We could not reach Profit Lens. Check your connection and try again."
            else -> "We could not activate this Android device yet. Please try again."
          }
        }
      }
    }
  }

  private fun isOnboardingComplete(
    profile: com.profitlens.android.core.data.model.UserProfile?,
    vehicles: List<com.profitlens.android.core.data.model.VehicleProfile>,
  ): Boolean {
    val defaultVehicleId = profile?.defaultVehicleId ?: return false
    return vehicles.any { it.id == defaultVehicleId }
  }
}

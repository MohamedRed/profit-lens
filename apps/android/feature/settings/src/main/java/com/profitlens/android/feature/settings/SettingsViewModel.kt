package com.profitlens.android.feature.settings

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.VehicleDraft
import com.profitlens.android.core.data.model.VehicleProfile
import com.profitlens.android.core.data.model.createVehicleDraft
import com.profitlens.android.core.data.model.toDraft
import com.profitlens.android.core.data.repository.BillingRepository
import com.profitlens.android.core.data.repository.DevicesRepository
import com.profitlens.android.core.data.repository.ProfileRepository
import com.profitlens.android.core.data.repository.VehiclesRepository
import com.profitlens.android.data.ProfitLensDeviceIdStore
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flatMapLatest
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class SettingsUiState(
  val loading: Boolean = true,
  val profile: UserProfile? = null,
  val profileDraft: UserProfile? = null,
  val vehicleDraft: VehicleDraft = createVehicleDraft(),
  val vehicles: List<VehicleProfile> = emptyList(),
  val devices: List<com.profitlens.android.core.data.model.DeviceEntry> = emptyList(),
  val currentPlanId: String = "free",
  val message: String? = null,
  val saving: Boolean = false,
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val profileRepository: ProfileRepository,
  private val vehiclesRepository: VehiclesRepository,
  private val devicesRepository: DevicesRepository,
  private val billingRepository: BillingRepository,
  private val deviceIdStore: ProfitLensDeviceIdStore,
  savedStateHandle: SavedStateHandle,
) : ViewModel() {
  private val message = MutableStateFlow<String?>(null)
  private val saving = MutableStateFlow(false)
  private val profileDraft = MutableStateFlow<UserProfile?>(null)
  private val vehicleDraft = MutableStateFlow(createVehicleDraft())
  private val editingVehicleId = savedStateHandle.get<String>("vehicleId")
  private val authUser = authRepository.watchUser().stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val profile = authUser.flatMapLatest { user ->
    user?.let { profileRepository.watchProfile(it.uid, it.email) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)
  private val vehicles = authUser.flatMapLatest { user ->
    user?.let { vehiclesRepository.watchVehicles(it.uid) } ?: flowOf(emptyList())
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val devices = authUser.flatMapLatest { user ->
    if (user == null) flowOf(emptyList()) else flowOf(deviceIdStore.getOrCreate()).flatMapLatest { currentId ->
      devicesRepository.watchDevices(user.uid, currentId)
    }
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())
  private val entitlement = authUser.flatMapLatest { user ->
    user?.let { billingRepository.watchEntitlement(it.uid) } ?: flowOf(null)
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), null)

  val uiState = combine(profile, profileDraft, vehicles, devices, entitlement, vehicleDraft, message, saving) { profileValue, profileDraftValue, vehiclesValue, devicesValue, entitlementValue, vehicleDraftValue, messageValue, savingValue ->
    SettingsUiState(
      loading = false,
      profile = profileValue,
      profileDraft = profileDraftValue ?: profileValue,
      vehicleDraft = vehicleDraftValue,
      vehicles = vehiclesValue,
      devices = devicesValue,
      currentPlanId = entitlementValue?.planId ?: "free",
      message = messageValue,
      saving = savingValue,
    )
  }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), SettingsUiState())

  init {
    viewModelScope.launch {
      profile.collect { currentProfile ->
        if (currentProfile != null && (profileDraft.value == null || profileDraft.value?.uid != currentProfile.uid)) {
          profileDraft.value = currentProfile
        }
      }
    }
    viewModelScope.launch {
      vehicles.collect { items ->
        val vehicle = items.firstOrNull { it.id == editingVehicleId }
        vehicleDraft.value = vehicle?.toDraft() ?: createVehicleDraft()
      }
    }
  }

  fun updateProfileDraft(transform: (UserProfile) -> UserProfile) {
    val current = profileDraft.value ?: profile.value ?: return
    profileDraft.value = transform(current)
  }

  fun saveProfile() {
    val current = profileDraft.value ?: return
    saving.value = true
    viewModelScope.launch {
      runCatching { profileRepository.save(current) }
        .onSuccess { message.value = "Profile updated." }
        .onFailure { message.value = "We could not save your profile." }
      saving.value = false
    }
  }

  fun updateVehicleDraft(transform: (VehicleDraft) -> VehicleDraft) {
    vehicleDraft.value = transform(vehicleDraft.value)
  }

  fun saveVehicle() {
    val user = authUser.value ?: return
    saving.value = true
    viewModelScope.launch {
      runCatching {
        vehiclesRepository.save(
          user.uid,
          VehicleProfile(
            id = vehicleDraft.value.id,
            name = vehicleDraft.value.name,
            licensePlate = vehicleDraft.value.licensePlate.ifBlank { null },
            brand = vehicleDraft.value.brand.ifBlank { null },
            model = vehicleDraft.value.model.ifBlank { null },
            registrationYear = vehicleDraft.value.registrationYear.toIntOrNull(),
            type = vehicleDraft.value.type,
            energyType = vehicleDraft.value.energyType,
            fuelType = vehicleDraft.value.fuelType.ifBlank { null },
            energyConsumptionPer100Km = vehicleDraft.value.energyConsumptionPer100Km.toDoubleOrNull() ?: 0.0,
            energyPricePerUnit = vehicleDraft.value.energyPricePerUnit.toDoubleOrNull() ?: 0.0,
            maintenancePerKm = vehicleDraft.value.maintenancePerKm.toDoubleOrNull() ?: 0.0,
            depreciationPerKm = vehicleDraft.value.depreciationPerKm.toDoubleOrNull() ?: 0.0,
          ),
        )
      }.onSuccess {
        message.value = "Vehicle saved."
      }.onFailure {
        message.value = "We could not save this vehicle."
      }
      saving.value = false
    }
  }

  fun deleteVehicle(vehicleId: String) {
    val user = authUser.value ?: return
    viewModelScope.launch {
      vehiclesRepository.delete(user.uid, vehicleId)
      message.value = "Vehicle removed."
    }
  }

  fun revokeDevice(deviceId: String) {
    viewModelScope.launch {
      runCatching { devicesRepository.revokeDevice(deviceId) }
        .onSuccess { message.value = "Device removed." }
        .onFailure { message.value = "This device could not be removed right now." }
    }
  }
}

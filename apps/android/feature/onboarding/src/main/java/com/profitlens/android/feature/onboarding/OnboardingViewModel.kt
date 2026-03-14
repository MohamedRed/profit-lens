package com.profitlens.android.feature.onboarding

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.profitlens.android.auth.AuthRepository
import com.profitlens.android.core.data.model.UserProfile
import com.profitlens.android.core.data.model.VehicleDraft
import com.profitlens.android.core.data.model.VehicleProfile
import com.profitlens.android.core.data.model.createVehicleDraft
import com.profitlens.android.core.data.model.defaultUserProfile
import com.profitlens.android.core.data.repository.ProfileRepository
import com.profitlens.android.core.data.repository.VehiclesRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class OnboardingState(
  val step: Int = 0,
  val saving: Boolean = false,
  val message: String? = null,
  val profile: UserProfile? = null,
  val vehicle: VehicleDraft = createVehicleDraft(),
)

@HiltViewModel
class OnboardingViewModel @Inject constructor(
  authRepository: AuthRepository,
  private val profileRepository: ProfileRepository,
  private val vehiclesRepository: VehiclesRepository,
) : ViewModel() {
  private val state = MutableStateFlow(OnboardingState())

  val uiState: StateFlow<OnboardingState> = combine(
    authRepository.watchUser(),
    state,
  ) { user, current ->
    current.copy(profile = current.profile ?: user?.let { defaultUserProfile(it.uid, it.email) })
  }.stateIn(viewModelScope, kotlinx.coroutines.flow.SharingStarted.WhileSubscribed(5_000), OnboardingState())

  fun setStep(step: Int) {
    state.value = state.value.copy(step = step.coerceIn(0, 2))
  }

  fun updateVehicle(transform: (VehicleDraft) -> VehicleDraft) {
    state.value = state.value.copy(vehicle = transform(state.value.vehicle))
  }

  fun updateProfile(transform: (UserProfile) -> UserProfile) {
    val profile = state.value.profile ?: return
    state.value = state.value.copy(profile = transform(profile))
  }

  fun finish() {
    val current = state.value
    val profile = current.profile ?: return
    state.value = current.copy(saving = true, message = null)
    viewModelScope.launch {
      runCatching {
        val vehicle = VehicleProfile(
          id = current.vehicle.id,
          name = current.vehicle.name,
          licensePlate = current.vehicle.licensePlate.ifBlank { null },
          brand = current.vehicle.brand.ifBlank { null },
          model = current.vehicle.model.ifBlank { null },
          registrationYear = current.vehicle.registrationYear.toIntOrNull(),
          type = current.vehicle.type,
          energyType = current.vehicle.energyType,
          fuelType = current.vehicle.fuelType.ifBlank { null },
          energyConsumptionPer100Km = current.vehicle.energyConsumptionPer100Km.toDoubleOrNull() ?: 0.0,
          energyPricePerUnit = current.vehicle.energyPricePerUnit.toDoubleOrNull() ?: 0.0,
          maintenancePerKm = current.vehicle.maintenancePerKm.toDoubleOrNull() ?: 0.0,
          depreciationPerKm = current.vehicle.depreciationPerKm.toDoubleOrNull() ?: 0.0,
        )
        vehiclesRepository.save(profile.uid, vehicle)
        profileRepository.save(profile.copy(defaultVehicleId = vehicle.id))
      }.onSuccess {
        state.value = state.value.copy(saving = false, message = null)
      }.onFailure {
        state.value = state.value.copy(
          saving = false,
          message = it.message ?: "Finish setup failed.",
        )
      }
    }
  }
}

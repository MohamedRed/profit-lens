package com.profitlens.android.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner

const val onboardingRoute = "onboarding"

fun NavGraphBuilder.onboardingGraph() {
  composable(onboardingRoute) {
    val viewModel: OnboardingViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = androidx.compose.foundation.layout.PaddingValues()) {
      SectionCard(
        title = "Finish setup",
        subtitle = "Add your default vehicle and operating costs before analyzing offers.",
      ) {
        StepHeader(step = state.step, onStepSelected = viewModel::setStep)
        when (state.step) {
          0 -> VehicleIdentityStep(state, viewModel)
          1 -> VehicleCostStep(state, viewModel)
          else -> ProfileCostStep(state, viewModel)
        }
        Button(
          onClick = {
            if (state.step < 2) {
              viewModel.setStep(state.step + 1)
            } else {
              viewModel.finish()
            }
          },
          enabled = !state.saving,
          modifier = Modifier.fillMaxWidth(),
        ) {
          Text(if (state.saving) "Saving..." else if (state.step < 2) "Next" else "Finish setup")
        }
      }
      state.message?.let { StatusBanner(message = it, tone = "error") }
    }
  }
}

@Composable
private fun StepHeader(step: Int, onStepSelected: (Int) -> Unit) {
  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    listOf("Vehicle", "Costs", "Business").forEachIndexed { index, label ->
      Button(onClick = { onStepSelected(index) }, modifier = Modifier.fillMaxWidth()) {
        Text("${index + 1}. $label${if (step == index) " · current" else ""}")
      }
    }
  }
}

@Composable
private fun VehicleIdentityStep(state: OnboardingState, viewModel: OnboardingViewModel) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    OutlinedTextField(
      value = state.vehicle.name,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(name = it) } },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Vehicle name") },
    )
    OutlinedTextField(
      value = state.vehicle.type,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(type = it) } },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Vehicle type") },
    )
    OutlinedTextField(
      value = state.vehicle.energyType,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(energyType = it) } },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Energy type") },
    )
    OutlinedTextField(
      value = state.vehicle.fuelType,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(fuelType = it) } },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Fuel type") },
    )
  }
}

@Composable
private fun VehicleCostStep(state: OnboardingState, viewModel: OnboardingViewModel) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    listOf(
      "Consumption / 100km" to state.vehicle.energyConsumptionPer100Km,
      "Energy price" to state.vehicle.energyPricePerUnit,
      "Maintenance / km" to state.vehicle.maintenancePerKm,
      "Depreciation / km" to state.vehicle.depreciationPerKm,
    ).forEach { (label, value) ->
      OutlinedTextField(
        value = value,
        onValueChange = {
          viewModel.updateVehicle { current ->
            when (label) {
              "Consumption / 100km" -> current.copy(energyConsumptionPer100Km = it)
              "Energy price" -> current.copy(energyPricePerUnit = it)
              "Maintenance / km" -> current.copy(maintenancePerKm = it)
              else -> current.copy(depreciationPerKm = it)
            }
          }
        },
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
      )
    }
  }
}

@Composable
private fun ProfileCostStep(state: OnboardingState, viewModel: OnboardingViewModel) {
  val profile = state.profile ?: return
  Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(bottom = 4.dp)) {
    OutlinedTextField(
      value = (profile.socialContributionRate * 100).toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(socialContributionRate = (it.toDoubleOrNull() ?: 0.0) / 100)
        }
      },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Social rate %") },
    )
    OutlinedTextField(
      value = profile.monthlyFixedCosts.toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(monthlyFixedCosts = it.toDoubleOrNull() ?: 0.0)
        }
      },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Monthly fixed costs") },
    )
    OutlinedTextField(
      value = profile.monthlyDeliveries.toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(monthlyDeliveries = it.toIntOrNull() ?: 0)
        }
      },
      modifier = Modifier.fillMaxWidth(),
      label = { Text("Monthly deliveries") },
    )
  }
}

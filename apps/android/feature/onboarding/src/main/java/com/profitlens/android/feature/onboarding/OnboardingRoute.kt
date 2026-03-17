package com.profitlens.android.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.SelectionOption
import com.profitlens.android.core.ui.SelectionPills
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
        PrimaryButton(
          label = if (state.saving) "Saving..." else if (state.step < 2) "Next" else "Finish setup",
          onClick = {
            if (state.step < 2) {
              viewModel.setStep(state.step + 1)
            } else {
              viewModel.finish()
            }
          },
          enabled = !state.saving,
        )
      }
      state.message?.let { StatusBanner(message = it, tone = "error") }
    }
  }
}

@Composable
private fun StepHeader(step: Int, onStepSelected: (Int) -> Unit) {
  SelectionPills(
    options = listOf(
      SelectionOption(id = "0", label = "Vehicle"),
      SelectionOption(id = "1", label = "Costs"),
      SelectionOption(id = "2", label = "Business"),
    ),
    selectedId = step.toString(),
    onSelected = { onStepSelected(it.toInt()) },
  )
}

@Composable
private fun VehicleIdentityStep(state: OnboardingState, viewModel: OnboardingViewModel) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    AppTextField(
      value = state.vehicle.name,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(name = it) } },
      label = "Vehicle name",
    )
    AppTextField(
      value = state.vehicle.type,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(type = it) } },
      label = "Vehicle type",
    )
    AppTextField(
      value = state.vehicle.energyType,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(energyType = it) } },
      label = "Energy type",
    )
    AppTextField(
      value = state.vehicle.fuelType,
      onValueChange = { viewModel.updateVehicle { current -> current.copy(fuelType = it) } },
      label = "Fuel type",
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
      AppTextField(
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
        label = label,
      )
    }
  }
}

@Composable
private fun ProfileCostStep(state: OnboardingState, viewModel: OnboardingViewModel) {
  val profile = state.profile ?: return
  Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(bottom = 4.dp)) {
    AppTextField(
      value = (profile.socialContributionRate * 100).toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(socialContributionRate = (it.toDoubleOrNull() ?: 0.0) / 100)
        }
      },
      label = "Social rate %",
    )
    AppTextField(
      value = profile.monthlyFixedCosts.toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(monthlyFixedCosts = it.toDoubleOrNull() ?: 0.0)
        }
      },
      label = "Monthly fixed costs",
    )
    AppTextField(
      value = profile.monthlyDeliveries.toString(),
      onValueChange = {
        viewModel.updateProfile { current ->
          current.copy(monthlyDeliveries = it.toIntOrNull() ?: 0)
        }
      },
      label = "Monthly deliveries",
    )
  }
}

package com.profitlens.android.feature.settings

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.profitlens.android.feature.billing.billingRoute

const val settingsRoute = "settings"
const val settingsProfileRoute = "settings/profile"
const val settingsVehiclesRoute = "settings/vehicles"
const val settingsDevicesRoute = "settings/devices"
private const val settingsVehicleEditorPattern = "settings/vehicles/editor?vehicleId={vehicleId}"

fun settingsVehicleEditorRoute(vehicleId: String? = null): String {
  return if (vehicleId == null) "settings/vehicles/editor" else "settings/vehicles/editor?vehicleId=$vehicleId"
}

fun NavGraphBuilder.settingsGraph(navController: NavController, padding: androidx.compose.foundation.layout.PaddingValues, onSignOut: () -> Unit) {
  composable(settingsRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SettingsHomeScreen(
      state = state,
      onProfile = { navController.navigate(settingsProfileRoute) },
      onVehicles = { navController.navigate(settingsVehiclesRoute) },
      onDevices = { navController.navigate(settingsDevicesRoute) },
      onBilling = { navController.navigate(billingRoute) },
      onSignOut = onSignOut,
      padding = padding,
    )
  }
  composable(settingsProfileRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ProfileSettingsScreen(
      state = state,
      onMinProfitChanged = {
        viewModel.updateProfileDraft { current -> current.copy(minProfitabilityEuro = it.toDoubleOrNull() ?: current.minProfitabilityEuro) }
      },
      onMonthlyCostsChanged = {
        viewModel.updateProfileDraft { current -> current.copy(monthlyFixedCosts = it.toDoubleOrNull() ?: current.monthlyFixedCosts) }
      },
      onMonthlyDeliveriesChanged = {
        viewModel.updateProfileDraft { current -> current.copy(monthlyDeliveries = it.toIntOrNull() ?: current.monthlyDeliveries) }
      },
      onSave = viewModel::saveProfile,
      padding = padding,
    )
  }
  composable(settingsVehiclesRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    VehiclesSettingsScreen(
      state = state,
      onAddVehicle = { navController.navigate(settingsVehicleEditorRoute()) },
      onEditVehicle = { navController.navigate(settingsVehicleEditorRoute(it)) },
      onDeleteVehicle = viewModel::deleteVehicle,
      padding = padding,
    )
  }
  composable(
    route = settingsVehicleEditorPattern,
    arguments = listOf(
      navArgument("vehicleId") {
        type = NavType.StringType
        nullable = true
        defaultValue = null
      },
    ),
  ) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    VehicleEditorScreen(
      state = state,
      onDraftChanged = viewModel::updateVehicleDraft,
      onSave = viewModel::saveVehicle,
      padding = padding,
    )
  }
  composable(settingsDevicesRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    DevicesSettingsScreen(
      state = state,
      onRevokeDevice = viewModel::revokeDevice,
      padding = padding,
    )
  }
}

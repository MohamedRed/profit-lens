package com.profitlens.android.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavType
import androidx.navigation.navArgument
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner
import com.profitlens.android.feature.billing.billingRoute

const val settingsRoute = "settings"
const val settingsProfileRoute = "settings/profile"
const val settingsVehiclesRoute = "settings/vehicles"
const val settingsDevicesRoute = "settings/devices"
private const val settingsVehicleEditorPattern = "settings/vehicles/editor?vehicleId={vehicleId}"

fun settingsVehicleEditorRoute(vehicleId: String? = null): String {
  return if (vehicleId == null) "settings/vehicles/editor" else "settings/vehicles/editor?vehicleId=$vehicleId"
}

fun NavGraphBuilder.settingsGraph(navController: NavController, padding: PaddingValues, onSignOut: () -> Unit) {
  composable(settingsRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = padding) {
      SectionCard(title = "Settings", subtitle = "Manage profile, vehicles, devices, and billing natively on Android.") {
        Text("Current plan: ${state.currentPlanId}")
        AppListRow(title = "Edit profile", subtitle = "Business costs, targets, and operating assumptions.", onClick = { navController.navigate(settingsProfileRoute) })
        AppListRow(title = "Manage vehicles", subtitle = "Update the delivery vehicles used in profitability analysis.", onClick = { navController.navigate(settingsVehiclesRoute) })
        AppListRow(title = "Manage devices", subtitle = "Review and revoke device registrations.", onClick = { navController.navigate(settingsDevicesRoute) })
        AppListRow(title = "Billing", subtitle = "Subscription status, usage, and Stripe management.", onClick = { navController.navigate(billingRoute) })
        SecondaryButton(label = "Sign out", onClick = onSignOut)
      }
      state.message?.let { StatusBanner(message = it, tone = "warning") }
    }
  }
  composable(settingsProfileRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = padding) {
      state.profileDraft?.let { profile ->
        SectionCard(title = "Profile", subtitle = "Adjust your business cost assumptions.") {
          SettingsNumberField("Minimum profit (€)", profile.minProfitabilityEuro.toString()) {
            viewModel.updateProfileDraft { current -> current.copy(minProfitabilityEuro = it.toDoubleOrNull() ?: current.minProfitabilityEuro) }
          }
          SettingsNumberField("Monthly fixed costs", profile.monthlyFixedCosts.toString()) {
            viewModel.updateProfileDraft { current -> current.copy(monthlyFixedCosts = it.toDoubleOrNull() ?: current.monthlyFixedCosts) }
          }
          SettingsNumberField("Monthly deliveries", profile.monthlyDeliveries.toString()) {
            viewModel.updateProfileDraft { current -> current.copy(monthlyDeliveries = it.toIntOrNull() ?: current.monthlyDeliveries) }
          }
          PrimaryButton(label = if (state.saving) "Saving…" else "Save profile", onClick = viewModel::saveProfile, enabled = !state.saving)
        }
      }
      state.message?.let { StatusBanner(message = it, tone = "warning") }
    }
  }
  composable(settingsVehiclesRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = padding) {
      SectionCard(title = "Vehicles", subtitle = "Create and maintain the vehicle profiles used for profitability analysis.") {
        PrimaryButton(label = "Add vehicle", onClick = { navController.navigate(settingsVehicleEditorRoute()) })
        if (state.vehicles.isEmpty()) {
          Text("No vehicles yet.")
        } else {
          state.vehicles.forEach { vehicle ->
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
              AppListRow(
                title = vehicle.name.ifBlank { "Untitled vehicle" },
                subtitle = listOfNotNull(
                  vehicle.brand?.takeIf { it.isNotBlank() },
                  vehicle.model?.takeIf { it.isNotBlank() },
                ).joinToString(" · ").ifBlank { "Tap to edit vehicle details." },
                supporting = vehicle.licensePlate?.takeIf { it.isNotBlank() },
                onClick = { navController.navigate(settingsVehicleEditorRoute(vehicle.id)) },
              )
              SecondaryButton(label = "Delete ${vehicle.name.ifBlank { "vehicle" }}", onClick = { viewModel.deleteVehicle(vehicle.id) })
            }
          }
        }
      }
      state.message?.let { StatusBanner(message = it, tone = "warning") }
    }
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
    ScrollColumn(padding = padding) {
      SectionCard(title = "Vehicle editor", subtitle = "Save the costs Profit Lens uses to score offers.") {
        VehicleEditorFields(state = state, onDraftChanged = viewModel::updateVehicleDraft)
        PrimaryButton(label = if (state.saving) "Saving…" else "Save vehicle", onClick = viewModel::saveVehicle, enabled = !state.saving)
      }
      state.message?.let { StatusBanner(message = it, tone = "warning") }
    }
  }
  composable(settingsDevicesRoute) {
    val viewModel: SettingsViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    ScrollColumn(padding = padding) {
      SectionCard(title = "Devices", subtitle = "Remove old device registrations from this account.") {
        if (state.devices.isEmpty()) {
          Text("No active devices found.")
        } else {
          state.devices.forEach { device ->
            AppListRow(
              title = device.deviceLabel ?: device.platform,
              subtitle = "Registered ${device.platform}",
              supporting = device.lastSeenAt?.let { "Last seen ${java.text.DateFormat.getDateTimeInstance().format(it)}" },
            )
            SecondaryButton(label = "Remove ${device.deviceLabel ?: device.platform}", onClick = { viewModel.revokeDevice(device.id) })
          }
        }
      }
      state.message?.let { StatusBanner(message = it, tone = "warning") }
    }
  }
}

@Composable
private fun SettingsNumberField(label: String, value: String, onValueChange: (String) -> Unit) {
  AppTextField(
    value = value,
    onValueChange = onValueChange,
    label = label,
  )
}

@Composable
private fun VehicleEditorFields(
  state: SettingsUiState,
  onDraftChanged: ((com.profitlens.android.core.data.model.VehicleDraft) -> com.profitlens.android.core.data.model.VehicleDraft) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    listOf(
      "Name" to state.vehicleDraft.name,
      "License plate" to state.vehicleDraft.licensePlate,
      "Brand" to state.vehicleDraft.brand,
      "Model" to state.vehicleDraft.model,
      "Registration year" to state.vehicleDraft.registrationYear,
      "Consumption / 100km" to state.vehicleDraft.energyConsumptionPer100Km,
      "Energy price" to state.vehicleDraft.energyPricePerUnit,
      "Maintenance / km" to state.vehicleDraft.maintenancePerKm,
      "Depreciation / km" to state.vehicleDraft.depreciationPerKm,
    ).forEach { (label, value) ->
      AppTextField(
        value = value,
        onValueChange = {
          onDraftChanged { current ->
            when (label) {
              "Name" -> current.copy(name = it)
              "License plate" -> current.copy(licensePlate = it)
              "Brand" -> current.copy(brand = it)
              "Model" -> current.copy(model = it)
              "Registration year" -> current.copy(registrationYear = it)
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

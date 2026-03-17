package com.profitlens.android.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.VehicleDraft
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.StatusBanner
import java.text.DateFormat

@Composable
internal fun SettingsHomeScreen(
  state: SettingsUiState,
  onProfile: () -> Unit,
  onVehicles: () -> Unit,
  onDevices: () -> Unit,
  onBilling: () -> Unit,
  onSignOut: () -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SettingsTile(
      title = "Profile",
      subtitle = "Business costs, default vehicle, and profitability target.",
      supporting = state.profile?.email ?: "Update your operating assumptions.",
      onClick = onProfile,
    )
    VehiclesSummaryCard(state = state, onVehicles = onVehicles)
    SettingsTile(
      title = "Subscription",
      subtitle = "Current plan: ${state.currentPlanId}",
      supporting = "Manage billing and offer limits.",
      onClick = onBilling,
    )
    SettingsTile(
      title = "Devices",
      subtitle = "Review and remove registered devices.",
      supporting = "${state.devices.size} active devices",
      onClick = onDevices,
    )
    Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
      Column(modifier = Modifier.padding(6.dp)) {
        SecondaryButton(label = "Sign out", onClick = onSignOut)
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
internal fun ProfileSettingsScreen(
  state: SettingsUiState,
  onMinProfitChanged: (String) -> Unit,
  onMonthlyCostsChanged: (String) -> Unit,
  onMonthlyDeliveriesChanged: (String) -> Unit,
  onSave: () -> Unit,
  padding: PaddingValues,
) {
  val profile = state.profileDraft ?: return
  ScrollColumn(padding = padding) {
    SettingsFormCard(
      title = "Profile",
      subtitle = "Adjust the business costs Profit Lens uses across Android and web.",
    ) {
      AppTextField(value = profile.minProfitabilityEuro.toString(), onValueChange = onMinProfitChanged, label = "Minimum profit (€)")
      AppTextField(value = profile.monthlyFixedCosts.toString(), onValueChange = onMonthlyCostsChanged, label = "Monthly fixed costs")
      AppTextField(value = profile.monthlyDeliveries.toString(), onValueChange = onMonthlyDeliveriesChanged, label = "Monthly deliveries")
      PrimaryButton(label = if (state.saving) "Saving..." else "Save profile", onClick = onSave, enabled = !state.saving)
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
internal fun VehiclesSettingsScreen(
  state: SettingsUiState,
  onAddVehicle: () -> Unit,
  onEditVehicle: (String) -> Unit,
  onDeleteVehicle: (String) -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SettingsFormCard(
      title = "Vehicles",
      subtitle = "These profiles mirror the Qwik vehicle list and power every profitability analysis.",
    ) {
      PrimaryButton(label = "Add vehicle", onClick = onAddVehicle)
      if (state.vehicles.isEmpty()) {
        Text("No vehicles yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      } else {
        state.vehicles.forEach { vehicle ->
          AppListRow(
            title = vehicle.name.ifBlank { "Untitled vehicle" },
            subtitle = listOfNotNull(vehicle.brand, vehicle.model).joinToString(" · ").ifBlank { "Tap to edit details." },
            supporting = vehicle.licensePlate,
            onClick = { onEditVehicle(vehicle.id) },
          )
          SecondaryButton(label = "Delete ${vehicle.name.ifBlank { "vehicle" }}", onClick = { onDeleteVehicle(vehicle.id) })
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
internal fun VehicleEditorScreen(
  state: SettingsUiState,
  onDraftChanged: ((VehicleDraft) -> VehicleDraft) -> Unit,
  onSave: () -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SettingsFormCard(title = "Vehicle editor", subtitle = "Save the exact cost model used in offer analysis.") {
      VehicleEditorFields(draft = state.vehicleDraft, onDraftChanged = onDraftChanged)
      PrimaryButton(label = if (state.saving) "Saving..." else "Save vehicle", onClick = onSave, enabled = !state.saving)
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
internal fun DevicesSettingsScreen(
  state: SettingsUiState,
  onRevokeDevice: (String) -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SettingsFormCard(title = "Devices", subtitle = "Remove old registrations from your account.") {
      if (state.devices.isEmpty()) {
        Text("No active devices found.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      } else {
        state.devices.forEach { device ->
          AppListRow(
            title = device.deviceLabel ?: device.platform,
            subtitle = "Registered ${device.platform}",
            supporting = device.lastSeenAt?.let { "Last seen ${DateFormat.getDateTimeInstance().format(it)}" },
          )
          SecondaryButton(label = "Remove ${device.deviceLabel ?: device.platform}", onClick = { onRevokeDevice(device.id) })
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
private fun SettingsTile(
  title: String,
  subtitle: String,
  supporting: String,
  onClick: () -> Unit,
) {
  Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
    AppListRow(title = title, subtitle = subtitle, supporting = supporting, onClick = onClick)
  }
}

@Composable
private fun VehiclesSummaryCard(
  state: SettingsUiState,
  onVehicles: () -> Unit,
) {
  Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
    Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
      Text(text = "Vehicles", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
      if (state.vehicles.isEmpty()) {
        Text("No vehicles added yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      } else {
        state.vehicles.take(3).forEach { vehicle ->
          AppListRow(
            title = vehicle.name.ifBlank { "Untitled vehicle" },
            subtitle = listOfNotNull(vehicle.brand, vehicle.model).joinToString(" · ").ifBlank { "Vehicle details" },
            supporting = vehicle.licensePlate,
            onClick = onVehicles,
          )
        }
      }
      SecondaryButton(label = "Manage vehicles", onClick = onVehicles)
    }
  }
}

@Composable
private fun SettingsFormCard(
  title: String,
  subtitle: String,
  content: @Composable () -> Unit,
) {
  Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
    Column(
      modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Text(text = title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
      Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      content()
    }
  }
}

@Composable
private fun VehicleEditorFields(
  draft: VehicleDraft,
  onDraftChanged: ((VehicleDraft) -> VehicleDraft) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
    field("Name", draft.name, onDraftChanged) { copy(name = it) }
    field("License plate", draft.licensePlate, onDraftChanged) { copy(licensePlate = it) }
    field("Brand", draft.brand, onDraftChanged) { copy(brand = it) }
    field("Model", draft.model, onDraftChanged) { copy(model = it) }
    field("Registration year", draft.registrationYear, onDraftChanged) { copy(registrationYear = it) }
    field("Consumption / 100km", draft.energyConsumptionPer100Km, onDraftChanged) { copy(energyConsumptionPer100Km = it) }
    field("Energy price", draft.energyPricePerUnit, onDraftChanged) { copy(energyPricePerUnit = it) }
    field("Maintenance / km", draft.maintenancePerKm, onDraftChanged) { copy(maintenancePerKm = it) }
    field("Depreciation / km", draft.depreciationPerKm, onDraftChanged) { copy(depreciationPerKm = it) }
  }
}

@Composable
private fun field(
  label: String,
  value: String,
  onDraftChanged: ((VehicleDraft) -> VehicleDraft) -> Unit,
  transform: VehicleDraft.(String) -> VehicleDraft,
) {
  AppTextField(
    value = value,
    onValueChange = { next -> onDraftChanged { current -> current.transform(next) } },
    label = label,
  )
}

package com.profitlens.android.feature.offer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.VehicleProfile
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.SecondaryButton
import kotlinx.coroutines.launch

private enum class OfferSettingsSheetView {
  Menu,
  Setup,
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun OfferSettingsSheet(
  isOpen: Boolean,
  minProfitabilityEuro: Double,
  savingProfitabilityTarget: Boolean,
  selectedVehicleId: String,
  vehicles: List<VehicleProfile>,
  onDismiss: () -> Unit,
  onVehicleSelected: (String) -> Unit,
  onOverlay: () -> Unit,
  onBilling: () -> Unit,
  onSaveProfitabilityTarget: suspend (String) -> Boolean,
) {
  if (!isOpen) {
    return
  }
  val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
  val coroutineScope = rememberCoroutineScope()
  var activeView by rememberSaveable { mutableStateOf(OfferSettingsSheetView.Menu) }
  var draftMinProfitability by rememberSaveable { mutableStateOf(formatMinProfitability(minProfitabilityEuro)) }
  var localError by rememberSaveable { mutableStateOf<String?>(null) }

  LaunchedEffect(isOpen, minProfitabilityEuro) {
    if (isOpen) {
      activeView = OfferSettingsSheetView.Menu
      draftMinProfitability = formatMinProfitability(minProfitabilityEuro)
      localError = null
    }
  }

  ModalBottomSheet(
    onDismissRequest = onDismiss,
    sheetState = sheetState,
    containerColor = MaterialTheme.colorScheme.surface,
  ) {
    when (activeView) {
      OfferSettingsSheetView.Menu -> OfferSettingsMenuView(
        minProfitabilityEuro = minProfitabilityEuro,
        selectedVehicleId = selectedVehicleId,
        vehicles = vehicles,
        onEdit = { activeView = OfferSettingsSheetView.Setup },
        onOverlay = {
          onDismiss()
          onOverlay()
        },
        onBilling = {
          onDismiss()
          onBilling()
        },
      )

      OfferSettingsSheetView.Setup -> OfferSettingsSetupView(
        draftMinProfitability = draftMinProfitability,
        localError = localError,
        savingProfitabilityTarget = savingProfitabilityTarget,
        selectedVehicleId = selectedVehicleId,
        vehicles = vehicles,
        onVehicleSelected = onVehicleSelected,
        onBack = { activeView = OfferSettingsSheetView.Menu },
        onDraftMinProfitabilityChanged = {
          draftMinProfitability = it
          localError = null
        },
        onSave = {
          val normalized = draftMinProfitability.trim().replace(',', '.')
          val parsed = normalized.toDoubleOrNull()
          if (parsed == null || parsed < 0.0) {
            localError = "Enter a valid minimum profit per km."
            return@OfferSettingsSetupView
          }
          coroutineScope.launch {
            val saved = onSaveProfitabilityTarget(normalized)
            if (saved) {
              onDismiss()
            }
          }
        },
      )
    }
  }
}

@Composable
private fun OfferSettingsMenuView(
  minProfitabilityEuro: Double,
  selectedVehicleId: String,
  vehicles: List<VehicleProfile>,
  onEdit: () -> Unit,
  onOverlay: () -> Unit,
  onBilling: () -> Unit,
) {
  val selectedVehicleName = vehicles.firstOrNull { it.id == selectedVehicleId }?.name ?: "Vehicle setup needed"
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp, vertical = 8.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    Text(
      text = "Offer settings",
      style = MaterialTheme.typography.titleLarge,
      color = MaterialTheme.colorScheme.onSurface,
    )
    Text(
      text = "Review the current vehicle, profitability target, billing access, and overlay controls.",
      style = MaterialTheme.typography.bodyMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    OfferSettingsSummaryChips(
      vehicleLabel = selectedVehicleName,
      minProfitabilityEuro = minProfitabilityEuro,
    )
    PrimaryButton(label = "Edit details", onClick = onEdit)
    SecondaryButton(label = "Open overlay monitor", onClick = onOverlay)
    SecondaryButton(label = "Manage subscription", onClick = onBilling)
  }
}

@Composable
private fun OfferSettingsSetupView(
  draftMinProfitability: String,
  localError: String?,
  savingProfitabilityTarget: Boolean,
  selectedVehicleId: String,
  vehicles: List<VehicleProfile>,
  onVehicleSelected: (String) -> Unit,
  onBack: () -> Unit,
  onDraftMinProfitabilityChanged: (String) -> Unit,
  onSave: () -> Unit,
) {
  Column(
    modifier = Modifier
      .fillMaxWidth()
      .padding(horizontal = 20.dp, vertical = 8.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.SpaceBetween,
    ) {
      TextButton(onClick = onBack) {
        Text("Back")
      }
      Text(
        text = "Edit details",
        style = MaterialTheme.typography.titleMedium,
        color = MaterialTheme.colorScheme.onSurface,
      )
      Box(modifier = Modifier.padding(horizontal = 12.dp))
    }
    OfferVehicleSelector(
      vehicles = vehicles,
      selectedVehicleId = selectedVehicleId,
      onVehicleSelected = onVehicleSelected,
    )
    AppTextField(
      value = draftMinProfitability,
      onValueChange = onDraftMinProfitabilityChanged,
      label = "Minimum profit per km (€)",
      singleLine = true,
    )
    Text(
      text = localError ?: "Suggested default: €2.00/km",
      style = MaterialTheme.typography.bodySmall,
      color = if (localError == null) MaterialTheme.colorScheme.onSurfaceVariant else MaterialTheme.colorScheme.error,
    )
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      SecondaryButton(
        label = "Cancel",
        onClick = onBack,
        modifier = Modifier.weight(1f),
      )
      PrimaryButton(
        label = if (savingProfitabilityTarget) "Saving..." else "Save",
        onClick = onSave,
        modifier = Modifier.weight(1f),
        enabled = !savingProfitabilityTarget,
      )
    }
  }
}

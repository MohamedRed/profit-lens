package com.profitlens.android.feature.offer

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.VehicleProfile
import java.util.Locale

@Composable
internal fun OfferVehicleSelector(
  vehicles: List<VehicleProfile>,
  selectedVehicleId: String,
  onVehicleSelected: (String) -> Unit,
) {
  var expanded by remember { mutableStateOf(false) }
  val selectedVehicleName = vehicles.firstOrNull { it.id == selectedVehicleId }?.name ?: "Select vehicle"

  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    Text(
      text = "Selected vehicle",
      style = MaterialTheme.typography.labelLarge,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Box(
      modifier = Modifier
        .fillMaxWidth()
        .background(
          color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
          shape = MaterialTheme.shapes.medium,
        )
        .clickable { expanded = true }
        .padding(horizontal = 16.dp, vertical = 15.dp),
    ) {
      Text(
        text = selectedVehicleName,
        style = MaterialTheme.typography.bodyLarge,
        color = MaterialTheme.colorScheme.onSurface,
      )
    }
    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
      vehicles.forEach { vehicle ->
        DropdownMenuItem(
          text = { Text(vehicle.name.ifBlank { "Untitled vehicle" }) },
          onClick = {
            expanded = false
            onVehicleSelected(vehicle.id)
          },
        )
      }
    }
  }
}

@Composable
internal fun OfferSettingsSummaryChips(
  vehicleLabel: String,
  minProfitabilityEuro: Double,
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(10.dp),
  ) {
    SummaryChip(text = vehicleLabel)
    SummaryChip(text = "€${"%.2f".format(Locale.US, minProfitabilityEuro)}/km")
  }
}

internal fun formatMinProfitability(value: Double): String {
  return "%.2f".format(Locale.US, value)
}

@Composable
private fun SummaryChip(text: String) {
  Box(
    modifier = Modifier
      .background(
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.10f),
        shape = RoundedCornerShape(999.dp),
      )
      .padding(horizontal = 14.dp, vertical = 10.dp),
  ) {
    Text(
      text = text,
      style = MaterialTheme.typography.labelLarge,
      color = MaterialTheme.colorScheme.primary,
    )
  }
}

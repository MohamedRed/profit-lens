package com.profitlens.android.feature.offer

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.VehicleProfile
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.SelectionOption
import com.profitlens.android.core.ui.SelectionPills
import com.profitlens.android.core.ui.StatusBanner

@Composable
internal fun OfferScreen(
  state: OfferUiState,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
  onVehicleSelected: (String) -> Unit,
  onAnalyzeManual: () -> Unit,
  onAnalyzeScreenshot: () -> Unit,
  onParseBulk: () -> Unit,
  onCommitBulk: () -> Unit,
  onOverlay: () -> Unit,
  onOfferSelected: (String) -> Unit,
  onPickScreenshot: (Uri?) -> Unit,
  onPickBulkScreenshot: (Uri?) -> Unit,
  padding: PaddingValues,
) {
  val screenshotPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent(), onPickScreenshot)
  val bulkPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent(), onPickBulkScreenshot)
  var selectedMode by rememberSaveable { mutableStateOf("single") }
  ScrollColumn(padding = padding) {
    StatusBanner(message = "Offers remaining this period: ${state.remainingOffersLabel}", tone = "success")
    SelectionPills(
      options = listOf(
        SelectionOption(id = "single", label = "Single"),
        SelectionOption(id = "bulk", label = "Bulk"),
      ),
      selectedId = selectedMode,
      onSelected = { selectedMode = it },
      maxWidth = 252.dp,
    )
    OverlayCard(
      vehicleLabel = state.vehicles.firstOrNull { it.id == state.selectedVehicleId }?.name ?: "Select a vehicle",
      vehicles = state.vehicles,
      selectedVehicleId = state.selectedVehicleId,
      onVehicleSelected = onVehicleSelected,
      onOverlay = onOverlay,
    )
    if (selectedMode == "single") {
      ManualOfferCard(state = state, onDraftChanged = onDraftChanged, onAnalyzeManual = onAnalyzeManual)
      ScreenshotCard(
        screenshotUri = state.screenshotUri,
        analyzing = state.analyzing,
        onPickScreenshot = { screenshotPicker.launch("image/*") },
        onAnalyzeScreenshot = onAnalyzeScreenshot,
      )
    } else {
      BulkImportCard(
        state = state,
        onPickScreenshot = { bulkPicker.launch("image/*") },
        onParseBulk = onParseBulk,
        onCommitBulk = onCommitBulk,
      )
    }
    state.latestAnalysis?.let { latest ->
      InfoCard(title = "Latest result", subtitle = "Most recent offer scored from Android.") {
        DetailText("Net profit", "€${"%.2f".format(latest.netProfitEuro)}")
        DetailText("Total costs", "€${"%.2f".format(latest.totalCostsEuro)}")
        DetailText("Pickup", latest.pickupAddress ?: "Unknown")
        DetailText("Dropoff", latest.dropoffAddress ?: "Unknown")
      }
    }
    RecentOffersCard(offers = state.recentOffers, onOfferSelected = onOfferSelected)
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
private fun OverlayCard(
  vehicleLabel: String,
  vehicles: List<VehicleProfile>,
  selectedVehicleId: String,
  onVehicleSelected: (String) -> Unit,
  onOverlay: () -> Unit,
) {
  var expanded by remember { mutableStateOf(false) }
  InfoCard(title = "Offer workspace", subtitle = "Match the Qwik offer shell while keeping the overlay native.") {
    SecondaryButton(label = vehicleLabel, onClick = { expanded = true })
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
    if (selectedVehicleId.isBlank()) {
      Text("Choose a vehicle before analyzing offers.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
    SecondaryButton(label = "Open overlay monitor", onClick = onOverlay)
  }
}

@Composable
private fun ManualOfferCard(
  state: OfferUiState,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
  onAnalyzeManual: () -> Unit,
) {
  InfoCard(title = "Single offer", subtitle = "Enter the visible courier offer details.") {
    val fields: List<Pair<String, String>> = listOf(
      "Payout (€)" to state.manualDraft.payoutEuro,
      "Distance (km)" to state.manualDraft.distanceKm,
      "Duration (minutes)" to state.manualDraft.durationMinutes,
      "Pickup name" to state.manualDraft.pickupName,
      "Pickup address" to state.manualDraft.pickupAddress,
      "Dropoff name" to state.manualDraft.dropoffName,
      "Dropoff address" to state.manualDraft.dropoffAddress,
    )
    fields.forEach { (label, value) ->
      AppTextField(
        value = value,
        onValueChange = { next ->
          onDraftChanged { current ->
            when (label) {
              "Payout (€)" -> current.copy(payoutEuro = next)
              "Distance (km)" -> current.copy(distanceKm = next)
              "Duration (minutes)" -> current.copy(durationMinutes = next)
              "Pickup name" -> current.copy(pickupName = next)
              "Pickup address" -> current.copy(pickupAddress = next)
              "Dropoff name" -> current.copy(dropoffName = next)
              else -> current.copy(dropoffAddress = next)
            }
          }
        },
        label = label,
      )
    }
    PrimaryButton(label = if (state.analyzing) "Analyzing..." else "Analyze offer", onClick = onAnalyzeManual, enabled = !state.analyzing)
  }
}

@Composable
private fun ScreenshotCard(
  screenshotUri: Uri?,
  analyzing: Boolean,
  onPickScreenshot: () -> Unit,
  onAnalyzeScreenshot: () -> Unit,
) {
  InfoCard(title = "Screenshot import", subtitle = "Import the same way the Qwik app does, but natively from Android.") {
    Text(text = screenshotUri?.toString() ?: "No screenshot selected.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    SecondaryButton(label = "Choose screenshot", onClick = onPickScreenshot)
    PrimaryButton(label = "Analyze screenshot", onClick = onAnalyzeScreenshot, enabled = !analyzing)
  }
}

@Composable
private fun BulkImportCard(
  state: OfferUiState,
  onPickScreenshot: () -> Unit,
  onParseBulk: () -> Unit,
  onCommitBulk: () -> Unit,
) {
  InfoCard(title = "Bulk import", subtitle = "Parse multiple offers from one screenshot.") {
    Text(text = state.bulkScreenshotUri?.toString() ?: "No screenshot selected.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    SecondaryButton(label = "Choose bulk screenshot", onClick = onPickScreenshot)
    PrimaryButton(label = "Parse bulk screenshot", onClick = onParseBulk, enabled = !state.analyzing)
    state.bulkPreview?.let { preview ->
      Text("Ready to save ${preview.parsedCount} rows. ${preview.invalidCount} rows were skipped.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      PrimaryButton(label = "Save parsed offers", onClick = onCommitBulk, enabled = !state.analyzing)
    }
  }
}

@Composable
private fun RecentOffersCard(
  offers: List<com.profitlens.android.core.data.model.OfferRecord>,
  onOfferSelected: (String) -> Unit,
) {
  InfoCard(title = "Recent offers", subtitle = "Open any saved offer to inspect its profitability breakdown.") {
    if (offers.isEmpty()) {
      Text("No saved offers yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    } else {
      offers.take(6).forEach { offer ->
        AppListRow(
          title = "€${"%.2f".format(offer.netProfitEuro)} net",
          subtitle = "${offer.pickupAddress ?: "Pickup unavailable"} → ${offer.dropoffAddress ?: "Dropoff unavailable"}",
          supporting = "€${"%.2f".format(offer.payoutEuro)} payout",
          onClick = { onOfferSelected(offer.id) },
        )
      }
    }
  }
}

@Composable
private fun InfoCard(
  title: String,
  subtitle: String,
  content: @Composable ColumnScope.() -> Unit,
) {
  Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
    Column(
      modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Column(verticalArrangement = Arrangement.spacedBy(4.dp), modifier = Modifier.fillMaxWidth()) {
        Text(text = title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
        Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
      content()
    }
  }
}

@Composable
private fun DetailText(label: String, value: String) {
  Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
    Text(text = label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Text(text = value, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
  }
}

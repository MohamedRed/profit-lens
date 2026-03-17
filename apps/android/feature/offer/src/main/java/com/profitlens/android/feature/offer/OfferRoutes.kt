package com.profitlens.android.feature.offer

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner
import com.profitlens.android.feature.history.historyDetailRoute
import com.profitlens.android.feature.overlay.overlayGraph
import com.profitlens.android.feature.overlay.overlayRoute

const val offerRoute = "offer"

fun NavGraphBuilder.offerGraph(navController: NavController, padding: PaddingValues) {
  composable(offerRoute) {
    val viewModel: OfferViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    OfferScreen(
      state = state,
      onDraftChanged = viewModel::updateDraft,
      onVehicleSelected = viewModel::selectVehicle,
      onAnalyzeManual = viewModel::analyzeManualOffer,
      onAnalyzeScreenshot = viewModel::analyzeScreenshotOffer,
      onParseBulk = viewModel::parseBulkScreenshot,
      onCommitBulk = viewModel::commitBulkImport,
      onOverlay = { navController.navigate(overlayRoute) },
      onOfferSelected = { navController.navigate(historyDetailRoute(it)) },
      onPickScreenshot = viewModel::setScreenshotUri,
      onPickBulkScreenshot = viewModel::setBulkScreenshotUri,
      padding = padding,
    )
  }
  overlayGraph(padding = padding)
}

@Composable
private fun OfferScreen(
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
  ScrollColumn(padding = padding) {
    SectionCard(
      title = "Analyze offers",
      subtitle = "Run single, screenshot, bulk, and live-overlay workflows from the native Android app.",
    ) {
      StatusBanner(message = "Offers remaining this period: ${state.remainingOffersLabel}", tone = "success")
      VehicleSelector(
        selectedVehicleId = state.selectedVehicleId,
        vehicles = state.vehicles,
        onVehicleSelected = onVehicleSelected,
      )
      SecondaryButton(label = "Open overlay monitor", onClick = onOverlay)
    }
    SectionCard(title = "Single offer", subtitle = "Enter the visible courier offer details.") {
      OfferDraftFields(draft = state.manualDraft, onDraftChanged = onDraftChanged)
      PrimaryButton(label = if (state.analyzing) "Analyzing…" else "Analyze manual offer", onClick = onAnalyzeManual, enabled = !state.analyzing)
    }
    SectionCard(title = "Screenshot import", subtitle = "Pick a screenshot from this device or from the Android share sheet.") {
      Text(state.screenshotUri?.toString() ?: "No screenshot selected.")
      SecondaryButton(label = "Choose screenshot", onClick = { screenshotPicker.launch("image/*") })
      PrimaryButton(label = "Analyze screenshot", onClick = onAnalyzeScreenshot, enabled = !state.analyzing)
    }
    SectionCard(title = "Bulk import", subtitle = "Parse and save multiple offers from one screenshot.") {
      Text(state.bulkScreenshotUri?.toString() ?: "No bulk screenshot selected.")
      SecondaryButton(label = "Choose bulk screenshot", onClick = { bulkPicker.launch("image/*") })
      PrimaryButton(label = "Parse bulk screenshot", onClick = onParseBulk, enabled = !state.analyzing)
      state.bulkPreview?.let { preview ->
        Text("Ready to save ${preview.parsedCount} rows. ${preview.invalidCount} rows were skipped.")
        PrimaryButton(label = "Save parsed offers", onClick = onCommitBulk, enabled = !state.analyzing)
      }
    }
    state.latestAnalysis?.let { latest ->
      SectionCard(title = "Latest result", subtitle = "Most recent offer scored from the Android app.") {
        Text("Net profit: €${"%.2f".format(latest.netProfitEuro)}")
        Text("Total costs: €${"%.2f".format(latest.totalCostsEuro)}")
        Text("Pickup: ${latest.pickupAddress ?: "Unknown"}")
        Text("Dropoff: ${latest.dropoffAddress ?: "Unknown"}")
      }
    }
    SectionCard(title = "Recent offers", subtitle = "Open a saved offer to review its full profitability breakdown.") {
      if (state.recentOffers.isEmpty()) {
        Text("No saved offers yet.")
      } else {
        state.recentOffers.take(6).forEach { offer ->
          AppListRow(
            title = "€${"%.2f".format(offer.netProfitEuro)} net · €${"%.2f".format(offer.payoutEuro)} payout",
            subtitle = "${offer.pickupAddress ?: "Pickup unavailable"} → ${offer.dropoffAddress ?: "Dropoff unavailable"}",
            onClick = { onOfferSelected(offer.id) },
          )
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }
}

@Composable
private fun OfferDraftFields(
  draft: OfferDraft,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
) {
  Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
    listOf(
      "Payout (€)" to draft.payoutEuro,
      "Distance (km)" to draft.distanceKm,
      "Duration (minutes)" to draft.durationMinutes,
      "Pickup name" to draft.pickupName,
      "Pickup address" to draft.pickupAddress,
      "Dropoff name" to draft.dropoffName,
      "Dropoff address" to draft.dropoffAddress,
    ).forEach { (label, value) ->
      AppTextField(
        value = value,
        onValueChange = {
          onDraftChanged { current ->
            when (label) {
              "Payout (€)" -> current.copy(payoutEuro = it)
              "Distance (km)" -> current.copy(distanceKm = it)
              "Duration (minutes)" -> current.copy(durationMinutes = it)
              "Pickup name" -> current.copy(pickupName = it)
              "Pickup address" -> current.copy(pickupAddress = it)
              "Dropoff name" -> current.copy(dropoffName = it)
              else -> current.copy(dropoffAddress = it)
            }
          }
        },
        label = label,
      )
    }
  }
}

@Composable
private fun VehicleSelector(
  selectedVehicleId: String,
  vehicles: List<com.profitlens.android.core.data.model.VehicleProfile>,
  onVehicleSelected: (String) -> Unit,
) {
  val expanded = remember { mutableStateOf(false) }
  Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
    SecondaryButton(
      label = vehicles.firstOrNull { it.id == selectedVehicleId }?.name ?: "Select a vehicle",
      onClick = { expanded.value = true },
    )
    AppTextField(
      value = vehicles.firstOrNull { it.id == selectedVehicleId }?.name ?: "Select a vehicle",
      onValueChange = {},
      readOnly = true,
      label = "Vehicle",
    )
    DropdownMenu(
      expanded = expanded.value,
      onDismissRequest = { expanded.value = false },
    ) {
      vehicles.forEach { vehicle ->
        DropdownMenuItem(
          text = { Text(vehicle.name.ifBlank { "Untitled vehicle" }) },
          onClick = {
            expanded.value = false
            onVehicleSelected(vehicle.id)
          },
        )
      }
    }
  }
}

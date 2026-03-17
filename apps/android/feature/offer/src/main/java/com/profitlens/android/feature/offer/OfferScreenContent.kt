package com.profitlens.android.feature.offer

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.LoadingState
import com.profitlens.android.core.ui.ScrollColumn
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
  onBilling: () -> Unit,
  onOfferSelected: (String) -> Unit,
  onPickScreenshot: (Uri?) -> Unit,
  onPickBulkScreenshot: (Uri?) -> Unit,
  onSaveProfitabilityTarget: suspend (String) -> Boolean,
  padding: PaddingValues,
) {
  val screenshotPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent(), onPickScreenshot)
  val bulkPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent(), onPickBulkScreenshot)
  var selectedMode by rememberSaveable { mutableStateOf("single") }
  var settingsOpen by rememberSaveable { mutableStateOf(false) }

  ScrollColumn(padding = padding) {
    if (state.loading) {
      LoadingState(label = "Loading offer workspace...")
      return@ScrollColumn
    }
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
    when (selectedMode) {
      "single" -> SingleOfferSections(
        state = state,
        onDraftChanged = onDraftChanged,
        onPickScreenshot = { screenshotPicker.launch("image/*") },
        onOpenSettings = { settingsOpen = true },
        onAnalyzeManual = onAnalyzeManual,
        onAnalyzeScreenshot = onAnalyzeScreenshot,
      )

      else -> BulkOfferSections(
        state = state,
        onPickScreenshot = { bulkPicker.launch("image/*") },
        onOpenSettings = { settingsOpen = true },
        onParseBulk = onParseBulk,
        onCommitBulk = onCommitBulk,
      )
    }
    state.latestAnalysis?.let { LatestResultCard(record = it) }
    RecentOffersCard(offers = state.recentOffers, onOfferSelected = onOfferSelected)
    state.message?.let { StatusBanner(message = it, tone = "warning") }
  }

  OfferSettingsSheet(
    isOpen = settingsOpen,
    minProfitabilityEuro = state.profile?.minProfitabilityEuro ?: 2.0,
    savingProfitabilityTarget = state.savingProfitabilityTarget,
    selectedVehicleId = state.selectedVehicleId,
    vehicles = state.vehicles,
    onDismiss = { settingsOpen = false },
    onVehicleSelected = onVehicleSelected,
    onOverlay = onOverlay,
    onBilling = onBilling,
    onSaveProfitabilityTarget = onSaveProfitabilityTarget,
  )
}

package com.profitlens.android.feature.offer

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.feature.billing.billingRoute
import com.profitlens.android.feature.history.historyDetailRoute
import com.profitlens.android.feature.overlay.overlayGraph
import com.profitlens.android.feature.overlay.overlayRoute

const val offerRoute = "offer"

fun NavGraphBuilder.offerGraph(navController: NavController, padding: androidx.compose.foundation.layout.PaddingValues) {
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
      onBilling = { navController.navigate(billingRoute) },
      onOfferSelected = { navController.navigate(historyDetailRoute(it)) },
      onPickScreenshot = viewModel::setScreenshotUri,
      onPickBulkScreenshot = viewModel::setBulkScreenshotUri,
      onSaveProfitabilityTarget = viewModel::saveProfitabilityTarget,
      padding = padding,
    )
  }
  overlayGraph(padding = padding)
}

package com.profitlens.android.feature.overlay

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.ui.OverlayMonitorScreen

const val overlayRoute = "offer/overlay"

fun NavGraphBuilder.overlayGraph(padding: PaddingValues) {
  composable(overlayRoute) {
    val viewModel: OverlayMonitorViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    OverlayMonitorScreen(
      padding = padding,
      state = state,
      onMonitoringChanged = viewModel::setMonitoringEnabled,
    )
  }
}

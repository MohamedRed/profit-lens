package com.profitlens.android.feature.history

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

fun NavGraphBuilder.historyGraph(navController: NavController, padding: androidx.compose.foundation.layout.PaddingValues) {
  composable(historyRoute) {
    val viewModel: HistoryViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HistoryScreen(
      state = state,
      onModeChanged = viewModel::setMode,
      onOfferSelected = { navController.navigate(historyDetailRoute(it)) },
      padding = padding,
    )
  }
  composable(historyDetailRoutePattern) {
    val viewModel: HistoryViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    HistoryDetailScreen(state = state, padding = padding)
  }
}

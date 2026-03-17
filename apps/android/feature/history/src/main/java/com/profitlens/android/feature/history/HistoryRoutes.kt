package com.profitlens.android.feature.history

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.SelectionOption
import com.profitlens.android.core.ui.SelectionPills
import java.text.DateFormat
import kotlin.math.absoluteValue

fun NavGraphBuilder.historyGraph(navController: NavController, padding: PaddingValues) {
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
    ScrollColumn(padding = padding) {
      state.selectedOffer?.let { offer ->
        SectionCard(title = "Offer detail", subtitle = "Saved profitability breakdown.") {
          Text("Net profit: €${"%.2f".format(offer.netProfitEuro)}")
          Text("Total costs: €${"%.2f".format(offer.totalCostsEuro)}")
          Text("Distance: ${"%.1f".format(offer.distanceKm)} km")
          Text("Pickup: ${offer.pickupAddress ?: "Unavailable"}")
          Text("Dropoff: ${offer.dropoffAddress ?: "Unavailable"}")
        }
      } ?: SectionCard(title = "Offer unavailable", subtitle = "This saved offer could not be loaded.") {}
    }
  }
}

@Composable
private fun HistoryScreen(
  state: HistoryUiState,
  onModeChanged: (String) -> Unit,
  onOfferSelected: (String) -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SectionCard(title = "History", subtitle = "Review saved offers and daily profitability trends.") {
      SelectionPills(
        options = listOf(
          SelectionOption(id = "list", label = "List"),
          SelectionOption(id = "chart", label = "Chart"),
        ),
        selectedId = state.selectedMode,
        onSelected = onModeChanged,
      )
    }
    if (state.selectedMode == "chart") {
      SectionCard(title = "Profit by day", subtitle = "Last 90 days of saved offer performance.") {
        val peak = state.stats.maxOfOrNull { it.netProfitEuro.absoluteValue }?.coerceAtLeast(1.0) ?: 1.0
        if (state.stats.isEmpty()) {
          Text("No chart data yet.")
        } else {
          state.stats.take(14).forEach { day ->
            Text(DateFormat.getDateInstance().format(day.dayStart))
            Box(
              modifier = Modifier
                .fillMaxWidth((day.netProfitEuro.absoluteValue / peak).toFloat())
                .height(10.dp)
                .background(
                  if (day.netProfitEuro >= 0) MaterialTheme.colorScheme.primary
                  else MaterialTheme.colorScheme.error,
                ),
            )
            Text("€${"%.2f".format(day.netProfitEuro)} net · ${day.offerCount} offers")
          }
        }
      }
    } else {
      SectionCard(title = "Saved offers", subtitle = "Open any offer to inspect its breakdown.") {
        if (state.offers.isEmpty()) {
          Text("No saved offers yet.")
        } else {
          state.offers.forEach { offer ->
            AppListRow(
              title = "€${"%.2f".format(offer.netProfitEuro)} net",
              subtitle = (offer.pickupAddress ?: "Unknown pickup") + " → " + (offer.dropoffAddress ?: "Unknown dropoff"),
              supporting = "€${"%.2f".format(offer.payoutEuro)} payout · ${"%.1f".format(offer.distanceKm)} km",
              onClick = { onOfferSelected(offer.id) },
            )
          }
        }
      }
    }
  }
}

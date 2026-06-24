package com.profitlens.android.feature.history

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SelectionOption
import com.profitlens.android.core.ui.SelectionPills
import kotlin.math.absoluteValue

@Composable
fun HistoryScreen(
  state: HistoryUiState,
  onModeChanged: (String) -> Unit,
  onOfferSelected: (String) -> Unit,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    SelectionPills(
      options = listOf(
        SelectionOption(id = "chart", label = "Charts"),
        SelectionOption(id = "list", label = "List"),
      ),
      selectedId = state.selectedMode,
      onSelected = onModeChanged,
      maxWidth = 232.dp,
    )
    if (state.selectedMode == "chart") {
      HistoryChartCard(state = state)
    } else {
      HistoryListCard(state = state, onOfferSelected = onOfferSelected)
    }
  }
}

@Composable
fun HistoryDetailScreen(
  state: HistoryUiState,
  padding: PaddingValues,
) {
  ScrollColumn(padding = padding) {
    state.selectedOffer?.let { offer ->
      Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
        Column(
          modifier = Modifier.padding(horizontal = 18.dp, vertical = 20.dp),
          verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
          Text(text = "Offer detail", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
          DetailRow(label = "Net profit", value = "€${"%.2f".format(offer.netProfitEuro)}")
          DetailRow(label = "Total costs", value = "€${"%.2f".format(offer.totalCostsEuro)}")
          DetailRow(label = "Distance", value = "${"%.1f".format(offer.distanceKm)} km")
          DetailRow(label = "Pickup", value = offer.pickupAddress ?: "Unavailable")
          DetailRow(label = "Dropoff", value = offer.dropoffAddress ?: "Unavailable")
        }
      }
    } ?: Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
      Text(
        text = "This saved offer could not be loaded.",
        modifier = Modifier.padding(18.dp),
        color = MaterialTheme.colorScheme.onSurfaceVariant,
      )
    }
  }
}

@Composable
private fun HistoryChartCard(state: HistoryUiState) {
  Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
    Column(
      modifier = Modifier.padding(horizontal = 18.dp, vertical = 20.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Text(text = "Profit by day", style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
      Text(text = "Last 90 days of saved offer performance.", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      val peak = state.stats.maxOfOrNull { it.netProfitEuro.absoluteValue }?.coerceAtLeast(1.0) ?: 1.0
      if (state.stats.isEmpty()) {
        Text("No chart data yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
      } else {
        state.stats.take(14).forEach { day ->
          Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
              Text(text = java.text.DateFormat.getDateInstance().format(day.dayStart), style = MaterialTheme.typography.labelLarge)
              Text(text = "€${"%.2f".format(day.netProfitEuro)}", style = MaterialTheme.typography.labelLarge)
            }
            Box(
              modifier = Modifier
                .fillMaxWidth()
                .height(10.dp)
                .background(MaterialTheme.colorScheme.surfaceVariant, MaterialTheme.shapes.small),
            ) {
              Box(
                modifier = Modifier
                  .fillMaxWidth((day.netProfitEuro.absoluteValue / peak).toFloat())
                  .height(10.dp)
                  .background(
                    if (day.netProfitEuro >= 0) MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.error,
                    MaterialTheme.shapes.small,
                  ),
              )
            }
            Text(text = "${day.offerCount} offers", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
          }
        }
      }
    }
  }
}

@Composable
private fun HistoryListCard(
  state: HistoryUiState,
  onOfferSelected: (String) -> Unit,
) {
  if (state.offers.isEmpty()) {
    Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
      Text(text = "No saved offers yet.", modifier = Modifier.padding(18.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
    return
  }
  state.offers.forEach { offer ->
    Card(shape = MaterialTheme.shapes.large, colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)) {
      AppListRow(
        title = "€${"%.2f".format(offer.netProfitEuro)}",
        subtitle = (offer.pickupAddress ?: "Unknown pickup") + " → " + (offer.dropoffAddress ?: "Unknown dropoff"),
        supporting = "€${"%.2f".format(offer.payoutEuro)} payout · ${"%.1f".format(offer.distanceKm)} km",
        onClick = { onOfferSelected(offer.id) },
        trailing = {
          Text(text = "›", style = MaterialTheme.typography.headlineSmall, color = MaterialTheme.colorScheme.primary)
        },
      )
    }
  }
}

@Composable
private fun DetailRow(label: String, value: String) {
  Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
    Text(text = label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    Text(text = value, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurface)
  }
}

package com.profitlens.android.feature.offer

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.OfferAnalysisRecord
import com.profitlens.android.core.data.model.OfferRecord
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.SectionCard
import java.util.Locale

@Composable
internal fun LatestResultCard(record: OfferAnalysisRecord) {
  SectionCard(
    title = "Latest result",
    subtitle = "Most recent offer scored from Android.",
  ) {
    DetailRow("Net profit", "€${"%.2f".format(Locale.US, record.netProfitEuro)}")
    DetailRow("Total costs", "€${"%.2f".format(Locale.US, record.totalCostsEuro)}")
    DetailRow("Pickup", record.pickupAddress ?: "Unknown")
    DetailRow("Drop-off", record.dropoffAddress ?: "Unknown")
  }
}

@Composable
internal fun RecentOffersCard(
  offers: List<OfferRecord>,
  onOfferSelected: (String) -> Unit,
) {
  SectionCard(
    title = "Recent offers",
    subtitle = "Open any saved offer to inspect its profitability breakdown.",
  ) {
    if (offers.isEmpty()) {
      Text("No saved offers yet.", color = MaterialTheme.colorScheme.onSurfaceVariant)
    } else {
      offers.take(6).forEach { offer ->
        AppListRow(
          title = "€${"%.2f".format(Locale.US, offer.netProfitEuro)} net",
          subtitle = "${offer.pickupAddress ?: "Pickup unavailable"} → ${offer.dropoffAddress ?: "Drop-off unavailable"}",
          supporting = "€${"%.2f".format(Locale.US, offer.payoutEuro)} payout",
          onClick = { onOfferSelected(offer.id) },
        )
      }
    }
  }
}

@Composable
private fun DetailRow(
  label: String,
  value: String,
) {
  Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
    Text(
      text = label,
      style = MaterialTheme.typography.labelMedium,
      color = MaterialTheme.colorScheme.onSurfaceVariant,
    )
    Text(
      text = value,
      style = MaterialTheme.typography.bodyLarge,
      color = MaterialTheme.colorScheme.onSurface,
    )
  }
}

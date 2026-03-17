package com.profitlens.android.feature.offer

import android.net.Uri
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.SectionCard

@Composable
internal fun SingleOfferSections(
  state: OfferUiState,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
  onPickScreenshot: () -> Unit,
  onOpenSettings: () -> Unit,
  onAnalyzeManual: () -> Unit,
  onAnalyzeScreenshot: () -> Unit,
) {
  OfferImportHeroCard(
    title = "Screenshot import",
    subtitle = "Choose a screenshot or open the same offer setup controls used to score the offer.",
    screenshotUri = state.screenshotUri,
    primaryLabel = "Choose screenshot",
    actionLabel = if (state.analyzing) "Analyzing..." else "Analyze screenshot",
    actionEnabled = state.screenshotUri != null && !state.analyzing,
    onPrimary = onPickScreenshot,
    onOpenSettings = onOpenSettings,
    onAction = onAnalyzeScreenshot,
  )
  ManualOfferCard(
    state = state,
    onDraftChanged = onDraftChanged,
    onAnalyzeManual = onAnalyzeManual,
  )
}

@Composable
internal fun BulkOfferSections(
  state: OfferUiState,
  onPickScreenshot: () -> Unit,
  onOpenSettings: () -> Unit,
  onParseBulk: () -> Unit,
  onCommitBulk: () -> Unit,
) {
  OfferImportHeroCard(
    title = "Bulk import",
    subtitle = "Choose a screenshot that contains multiple offers and parse it with your current offer setup.",
    screenshotUri = state.bulkScreenshotUri,
    primaryLabel = "Choose bulk screenshot",
    actionLabel = if (state.analyzing) "Parsing..." else "Parse bulk screenshot",
    actionEnabled = state.bulkScreenshotUri != null && !state.analyzing,
    onPrimary = onPickScreenshot,
    onOpenSettings = onOpenSettings,
    onAction = onParseBulk,
  )
  state.bulkPreview?.let { preview ->
    SectionCard(
      title = "Parsed offers",
      subtitle = "Review the extracted rows before saving them to your history.",
    ) {
      Text(
        text = "Ready to save ${preview.parsedCount} offers. ${preview.invalidCount} rows were skipped.",
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        style = MaterialTheme.typography.bodyMedium,
      )
      PrimaryButton(
        label = if (state.analyzing) "Saving..." else "Save parsed offers",
        onClick = onCommitBulk,
        enabled = !state.analyzing,
      )
    }
  }
}

@Composable
private fun OfferImportHeroCard(
  title: String,
  subtitle: String,
  screenshotUri: Uri?,
  primaryLabel: String,
  actionLabel: String,
  actionEnabled: Boolean,
  onPrimary: () -> Unit,
  onOpenSettings: () -> Unit,
  onAction: () -> Unit,
) {
  SectionCard(title = title, subtitle = subtitle) {
    Row(
      modifier = Modifier.fillMaxWidth(),
      horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      CompactSetupButton(onClick = onOpenSettings)
      PrimaryButton(
        label = primaryLabel,
        onClick = onPrimary,
        modifier = Modifier.weight(1f),
      )
    }
    OfferSelectionState(
      screenshotUri = screenshotUri,
      actionLabel = actionLabel,
      actionEnabled = actionEnabled,
      onAction = onAction,
    )
  }
}

@Composable
private fun CompactSetupButton(onClick: () -> Unit) {
  OutlinedButton(
    onClick = onClick,
    modifier = Modifier
      .widthIn(min = 84.dp)
      .heightIn(min = 48.dp),
    shape = MaterialTheme.shapes.large,
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.7f)),
    colors = ButtonDefaults.outlinedButtonColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.primary,
    ),
  ) {
    Text(
      text = "Setup",
      style = MaterialTheme.typography.labelLarge,
      color = MaterialTheme.colorScheme.primary,
    )
  }
}

@Composable
private fun OfferSelectionState(
  screenshotUri: Uri?,
  actionLabel: String,
  actionEnabled: Boolean,
  onAction: () -> Unit,
) {
  val supporting = if (screenshotUri == null) {
    "No screenshot selected yet."
  } else {
    "Selected screenshot: ${screenshotUri.lastPathSegment ?: "Ready to analyze"}"
  }
  Card(
    modifier = Modifier.fillMaxWidth(),
    shape = MaterialTheme.shapes.medium,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f)),
  ) {
    Column(
      modifier = Modifier.padding(14.dp),
      verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
      Text(
        text = supporting,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        style = MaterialTheme.typography.bodyMedium,
        maxLines = 2,
        overflow = TextOverflow.Ellipsis,
      )
      PrimaryButton(label = actionLabel, onClick = onAction, enabled = actionEnabled)
    }
  }
}

@Composable
private fun ManualOfferCard(
  state: OfferUiState,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
  onAnalyzeManual: () -> Unit,
) {
  SectionCard(
    title = "Offer details",
    subtitle = "Manual entry stays visible in single mode so you can score offers without leaving the page.",
  ) {
    MetricRow(
      first = FieldSpec("Payout (€)", state.manualDraft.payoutEuro) { copy(payoutEuro = it) },
      second = FieldSpec("Distance (km)", state.manualDraft.distanceKm) { copy(distanceKm = it) },
      third = FieldSpec("Duration (minutes)", state.manualDraft.durationMinutes) { copy(durationMinutes = it) },
      onDraftChanged = onDraftChanged,
    )
    TextPairRow(
      first = FieldSpec("Pickup name", state.manualDraft.pickupName) { copy(pickupName = it) },
      second = FieldSpec("Drop-off name", state.manualDraft.dropoffName) { copy(dropoffName = it) },
      onDraftChanged = onDraftChanged,
    )
    TextPairRow(
      first = FieldSpec("Pickup address", state.manualDraft.pickupAddress) { copy(pickupAddress = it) },
      second = FieldSpec("Drop-off address", state.manualDraft.dropoffAddress) { copy(dropoffAddress = it) },
      onDraftChanged = onDraftChanged,
    )
    PrimaryButton(
      label = if (state.analyzing) "Analyzing..." else "Analyze offer",
      onClick = onAnalyzeManual,
      enabled = !state.analyzing,
    )
  }
}

private data class FieldSpec(
  val label: String,
  val value: String,
  val transform: OfferDraft.(String) -> OfferDraft,
)

@Composable
private fun MetricRow(
  first: FieldSpec,
  second: FieldSpec,
  third: FieldSpec,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    listOf(first, second, third).forEach { spec ->
      AppTextField(
        value = spec.value,
        onValueChange = { next -> onDraftChanged { current -> spec.transform.invoke(current, next) } },
        label = spec.label,
        modifier = Modifier.weight(1f),
        singleLine = true,
      )
    }
  }
}

@Composable
private fun TextPairRow(
  first: FieldSpec,
  second: FieldSpec,
  onDraftChanged: ((OfferDraft) -> OfferDraft) -> Unit,
) {
  Row(
    modifier = Modifier.fillMaxWidth(),
    horizontalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    listOf(first, second).forEach { spec ->
      AppTextField(
        value = spec.value,
        onValueChange = { next -> onDraftChanged { current -> spec.transform.invoke(current, next) } },
        label = spec.label,
        modifier = Modifier.weight(1f),
      )
    }
  }
}

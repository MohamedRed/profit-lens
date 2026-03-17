package com.profitlens.android.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SectionCard(
  title: String,
  subtitle: String? = null,
  content: @Composable ColumnScope.() -> Unit,
) {
  Card(
    modifier = Modifier.fillMaxWidth(),
    shape = MaterialTheme.shapes.large,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.6f)),
  ) {
    Column(
      modifier = Modifier.padding(18.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Text(text = title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onSurface)
      if (!subtitle.isNullOrBlank()) {
        Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      }
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        content()
      }
    }
  }
}

@Composable
fun EmptyState(title: String, body: String, actionLabel: String? = null, onAction: (() -> Unit)? = null) {
  SectionCard(title = title, subtitle = body) {
    if (actionLabel != null && onAction != null) {
      PrimaryButton(label = actionLabel, onClick = onAction)
    }
  }
}

@Composable
fun StatusBanner(message: String, tone: String) {
  val container = when (tone) {
    "success" -> MaterialTheme.colorScheme.secondaryContainer
    "warning" -> MaterialTheme.colorScheme.tertiaryContainer
    else -> MaterialTheme.colorScheme.errorContainer
  }
  val textColor = when (tone) {
    "success" -> MaterialTheme.colorScheme.onSecondaryContainer
    "warning" -> MaterialTheme.colorScheme.onTertiaryContainer
    else -> MaterialTheme.colorScheme.onErrorContainer
  }
  Card(
    modifier = Modifier.fillMaxWidth(),
    shape = MaterialTheme.shapes.medium,
    colors = CardDefaults.cardColors(containerColor = container),
    border = BorderStroke(1.dp, textColor.copy(alpha = 0.14f)),
  ) {
    Text(
      text = message,
      modifier = Modifier.padding(16.dp),
      color = textColor,
      style = MaterialTheme.typography.bodyMedium,
    )
  }
}

@Composable
fun LoadingState(label: String) {
  Box(modifier = Modifier.fillMaxWidth().padding(vertical = 36.dp), contentAlignment = Alignment.Center) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
      CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
      Text(label, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
  }
}

@Composable
fun DualActionRow(primaryLabel: String, onPrimary: () -> Unit, secondaryLabel: String? = null, onSecondary: (() -> Unit)? = null) {
  Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
    if (secondaryLabel != null && onSecondary != null) {
      SecondaryButton(label = secondaryLabel, onClick = onSecondary, modifier = Modifier.weight(1f))
    }
    PrimaryButton(label = primaryLabel, onClick = onPrimary, modifier = Modifier.weight(1f))
  }
}

package com.profitlens.android.core.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
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
  Card(modifier = Modifier.fillMaxWidth()) {
    Column(
      modifier = Modifier.padding(18.dp),
      verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
      Text(text = title, style = MaterialTheme.typography.titleLarge)
      if (!subtitle.isNullOrBlank()) {
        Text(text = subtitle, style = MaterialTheme.typography.bodyMedium)
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
      Button(onClick = onAction) {
        Text(actionLabel)
      }
    }
  }
}

@Composable
fun StatusBanner(message: String, tone: String) {
  val color = when (tone) {
    "success" -> MaterialTheme.colorScheme.primary
    "warning" -> MaterialTheme.colorScheme.secondary
    else -> MaterialTheme.colorScheme.error
  }
  Card(modifier = Modifier.fillMaxWidth()) {
    Text(
      text = message,
      modifier = Modifier.padding(16.dp),
      color = color,
      style = MaterialTheme.typography.bodyMedium,
    )
  }
}

@Composable
fun LoadingState(label: String) {
  Box(modifier = Modifier.fillMaxWidth().padding(vertical = 36.dp), contentAlignment = Alignment.Center) {
    Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
      CircularProgressIndicator()
      Text(label)
    }
  }
}

@Composable
fun DualActionRow(primaryLabel: String, onPrimary: () -> Unit, secondaryLabel: String? = null, onSecondary: (() -> Unit)? = null) {
  Row(horizontalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.fillMaxWidth()) {
    if (secondaryLabel != null && onSecondary != null) {
      OutlinedButton(onClick = onSecondary, modifier = Modifier.weight(1f)) {
        Text(secondaryLabel)
      }
    }
    Button(onClick = onPrimary, modifier = Modifier.weight(1f)) {
      Text(primaryLabel)
    }
  }
}

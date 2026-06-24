package com.profitlens.android.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.defaultMinSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp

@Composable
fun PrimaryButton(
  label: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
) {
  Button(
    onClick = onClick,
    enabled = enabled,
    modifier = modifier
      .fillMaxWidth()
      .testTag("button:$label")
      .defaultMinSize(minHeight = 48.dp),
    shape = MaterialTheme.shapes.large,
    colors = ButtonDefaults.buttonColors(
      containerColor = MaterialTheme.colorScheme.primary,
      contentColor = MaterialTheme.colorScheme.onPrimary,
      disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
      disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
    ),
  ) {
    Text(text = label, style = MaterialTheme.typography.labelLarge)
  }
}

@Composable
fun SecondaryButton(
  label: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
) {
  OutlinedButton(
    onClick = onClick,
    enabled = enabled,
    modifier = modifier
      .fillMaxWidth()
      .testTag("button:$label")
      .defaultMinSize(minHeight = 48.dp),
    shape = MaterialTheme.shapes.large,
    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.7f)),
    colors = ButtonDefaults.outlinedButtonColors(
      containerColor = MaterialTheme.colorScheme.surface,
      contentColor = MaterialTheme.colorScheme.primary,
      disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
      disabledContentColor = MaterialTheme.colorScheme.onSurfaceVariant,
    ),
  ) {
    Text(text = label, style = MaterialTheme.typography.labelLarge)
  }
}

@Composable
fun QuietButton(
  label: String,
  onClick: () -> Unit,
  modifier: Modifier = Modifier,
  enabled: Boolean = true,
) {
  TextButton(
    onClick = onClick,
    enabled = enabled,
    modifier = modifier
      .fillMaxWidth()
      .testTag("button:$label"),
    shape = MaterialTheme.shapes.large,
    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.primary),
  ) {
    Text(text = label, style = MaterialTheme.typography.labelLarge)
  }
}

package com.profitlens.android.core.ui

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag

@Composable
fun AppTextField(
  value: String,
  onValueChange: (String) -> Unit,
  label: String,
  modifier: Modifier = Modifier,
  singleLine: Boolean = false,
  readOnly: Boolean = false,
  minLines: Int = 1,
) {
  OutlinedTextField(
    value = value,
    onValueChange = onValueChange,
    modifier = modifier
      .fillMaxWidth()
      .testTag("field:$label"),
    singleLine = singleLine,
    readOnly = readOnly,
    minLines = minLines,
    shape = MaterialTheme.shapes.medium,
    label = { Text(label) },
    colors = OutlinedTextFieldDefaults.colors(
      focusedContainerColor = MaterialTheme.colorScheme.surface,
      unfocusedContainerColor = MaterialTheme.colorScheme.surface,
      disabledContainerColor = MaterialTheme.colorScheme.surfaceVariant,
      focusedBorderColor = MaterialTheme.colorScheme.primary,
      unfocusedBorderColor = MaterialTheme.colorScheme.outline,
      focusedLabelColor = MaterialTheme.colorScheme.primary,
      unfocusedLabelColor = MaterialTheme.colorScheme.onSurfaceVariant,
      cursorColor = MaterialTheme.colorScheme.primary,
    ),
  )
}

package com.profitlens.android.core.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

data class SelectionOption(
  val id: String,
  val label: String,
)

@Composable
fun SelectionPills(
  options: List<SelectionOption>,
  selectedId: String,
  onSelected: (String) -> Unit,
  modifier: Modifier = Modifier,
  maxWidth: Dp? = null,
) {
  BoxWithConstraints(
    modifier = modifier.fillMaxWidth(),
    contentAlignment = Alignment.Center,
  ) {
    Surface(
      modifier = Modifier
        .fillMaxWidth()
        .then(if (maxWidth != null) Modifier.widthIn(max = maxWidth) else Modifier),
      shape = RoundedCornerShape(18.dp),
      color = MaterialTheme.colorScheme.surface,
      border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.52f)),
    ) {
      Row(
        modifier = Modifier.padding(4.dp),
        horizontalArrangement = Arrangement.spacedBy(4.dp),
      ) {
        options.forEach { option ->
          val selected = option.id == selectedId
          Box(
            modifier = Modifier
              .weight(1f)
              .heightIn(min = 44.dp)
              .clip(RoundedCornerShape(14.dp))
              .background(
                if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.14f)
                else MaterialTheme.colorScheme.surface,
              ),
            contentAlignment = Alignment.Center,
          ) {
            Surface(
              modifier = Modifier
                .fillMaxWidth()
                .testTag("selection:${option.label}"),
              shape = RoundedCornerShape(14.dp),
              color = androidx.compose.ui.graphics.Color.Transparent,
              onClick = { onSelected(option.id) },
            ) {
              Box(
                modifier = Modifier.padding(horizontal = 10.dp, vertical = 12.dp),
                contentAlignment = Alignment.Center,
              ) {
                Text(
                  text = option.label,
                  style = MaterialTheme.typography.labelLarge,
                  color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                )
              }
            }
          }
        }
      }
    }
  }
}

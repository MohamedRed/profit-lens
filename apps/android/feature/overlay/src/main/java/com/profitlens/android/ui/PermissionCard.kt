package com.profitlens.android.ui

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.SectionCard

@Composable
fun PermissionCard(
  title: String,
  granted: Boolean,
  context: Context,
  intent: Intent,
) {
  SectionCard(title = title, subtitle = if (granted) "Granted" else "Required") {
    AppListRow(
      title = if (granted) "Ready" else "Action required",
      subtitle = if (granted) "Profit Lens can use this permission." else "Open Android settings to grant access.",
    )
    if (!granted) {
      SecondaryButton(label = "Open settings", onClick = { context.startActivity(intent) })
    }
  }
}

package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner

@Composable
fun OverlayMonitorScreen(
  padding: PaddingValues,
  state: OverlayMonitorUiState,
  onMonitoringChanged: (Boolean) -> Unit,
) {
  val context = LocalContext.current
  ScrollColumn(padding = padding) {
    SectionCard(
      title = "Overlay monitor",
      subtitle = "Show a live profitability badge on supported courier offer screens.",
    ) {
      Text(text = state.user?.email ?: "", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
      androidx.compose.material3.Surface(
        shape = MaterialTheme.shapes.large,
        color = MaterialTheme.colorScheme.surface,
        border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline.copy(alpha = 0.6f)),
      ) {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
        ) {
          Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(text = "Live overlay")
            Text(text = "Uber Eats: ${state.featureFlags.uberEatsEnabled} · Deliveroo: ${state.featureFlags.deliverooEnabled}")
          }
          Switch(checked = state.monitoringEnabled, onCheckedChange = onMonitoringChanged)
        }
      }
    }
    PermissionCard("Accessibility access", state.accessibilityEnabled, context, buildAccessibilitySettingsIntent(context))
    PermissionCard("Fine location", state.fineLocationGranted, context, buildAppSettingsIntent(context))
    PermissionCard("Background location", state.backgroundLocationGranted, context, buildAppSettingsIntent(context))
    PermissionCard("Battery optimization", state.batteryOptimizedIgnored, context, buildAppSettingsIntent(context))
    state.message?.let { StatusBanner(message = it, tone = "warning") }
    SectionCard(title = "Recent overlay sessions", subtitle = "The latest scored or unsupported live offers on this device.") {
      if (state.sessions.isEmpty()) {
        Text("No live offer sessions yet.")
      } else {
        state.sessions.forEach { session ->
          AppListRow(
            title = session.provider.replace('_', ' '),
            subtitle = "${session.status} ${session.netProfitEuro?.let { "(${String.format("%.2f", it)} EUR)" } ?: ""}",
            supporting = session.reasonCode,
          )
        }
      }
    }
  }
}

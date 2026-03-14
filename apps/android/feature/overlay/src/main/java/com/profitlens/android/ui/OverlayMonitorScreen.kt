package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
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
      Text(text = state.user?.email ?: "")
      Card {
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
          Card {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
              Text(text = session.provider.replace('_', ' '))
              Text(text = "${session.status} ${session.netProfitEuro?.let { "(${String.format("%.2f", it)} EUR)" } ?: ""}")
              if (!session.reasonCode.isNullOrBlank()) {
                Text(text = session.reasonCode)
              }
            }
          }
        }
      }
    }
  }
}

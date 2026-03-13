package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
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

@Composable
fun OverlayMonitorScreen(
  state: OverlayMonitorUiState,
  onSignOut: () -> Unit,
  onMonitoringChanged: (Boolean) -> Unit,
) {
  val context = LocalContext.current
  LazyColumn(
    modifier = Modifier
      .fillMaxSize()
      .padding(16.dp),
    verticalArrangement = Arrangement.spacedBy(12.dp),
  ) {
    item {
      Text(text = "Overlay Monitor", style = MaterialTheme.typography.headlineMedium)
      Text(text = state.user?.email ?: "")
    }
    item {
      PermissionCard("Accessibility access", state.accessibilityEnabled, context, buildAccessibilitySettingsIntent(context))
    }
    item {
      PermissionCard("Fine location", state.fineLocationGranted, context, buildAppSettingsIntent(context))
    }
    item {
      PermissionCard("Background location", state.backgroundLocationGranted, context, buildAppSettingsIntent(context))
    }
    item {
      PermissionCard("Battery optimization", state.batteryOptimizedIgnored, context, buildAppSettingsIntent(context))
    }
    item {
      Card {
        Row(
          modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
          horizontalArrangement = Arrangement.SpaceBetween,
        ) {
          Column {
            Text(text = "Live overlay")
            Text(text = "Uber Eats: ${state.featureFlags.uberEatsEnabled} | Deliveroo: ${state.featureFlags.deliverooEnabled}")
          }
          Switch(checked = state.monitoringEnabled, onCheckedChange = onMonitoringChanged)
        }
      }
    }
    item {
      if (!state.message.isNullOrBlank()) {
        Text(text = state.message)
      }
    }
    item {
      Text(text = "Recent sessions", style = MaterialTheme.typography.titleMedium)
    }
    items(state.sessions, key = { it.sessionId }) { session ->
      Card {
        Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
          Text(text = session.provider)
          Text(text = "${session.status} ${session.netProfitEuro?.let { "(${String.format("%.2f", it)} EUR)" } ?: ""}")
          if (!session.reasonCode.isNullOrBlank()) {
            Text(text = session.reasonCode)
          }
        }
      }
    }
    item {
      Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) {
        Text("Sign out")
      }
    }
  }
}

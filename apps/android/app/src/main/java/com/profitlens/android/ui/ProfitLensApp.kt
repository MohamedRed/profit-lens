package com.profitlens.android.ui

import android.content.Context
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
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp

@Composable
fun ProfitLensApp(
  state: OverlayMonitorUiState,
  onSignIn: (String, String) -> Unit,
  onSignOut: () -> Unit,
  onMonitoringChanged: (Boolean) -> Unit,
) {
  MaterialTheme {
    if (state.user == null) {
      SignInScreen(
        firebaseReady = state.firebaseReady,
        loading = state.loading,
        message = state.message,
        onSignIn = onSignIn,
      )
    } else {
      OverlayMonitorScreen(
        state = state,
        onSignOut = onSignOut,
        onMonitoringChanged = onMonitoringChanged,
      )
    }
  }
}

@Composable
private fun SignInScreen(
  firebaseReady: Boolean,
  loading: Boolean,
  message: String?,
  onSignIn: (String, String) -> Unit,
) {
  var email by remember { mutableStateOf("") }
  var password by remember { mutableStateOf("") }
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(24.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    Text(text = "Profit Lens Android", style = MaterialTheme.typography.headlineMedium)
    Text(text = "Sign in to enable the live courier overlay.")
    if (!firebaseReady) {
      Text(text = "Firebase is not configured for this build.", color = MaterialTheme.colorScheme.error)
    }
    OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth())
    OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("Password") }, modifier = Modifier.fillMaxWidth())
    Button(
      onClick = { onSignIn(email.trim(), password) },
      enabled = firebaseReady && !loading && email.isNotBlank() && password.isNotBlank(),
    ) {
      Text(if (loading) "Signing in..." else "Sign in")
    }
    if (!message.isNullOrBlank()) {
      Text(text = message)
    }
  }
}

@Composable
private fun OverlayMonitorScreen(
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

@Composable
private fun PermissionCard(
  title: String,
  granted: Boolean,
  context: Context,
  intent: android.content.Intent,
) {
  Card {
    Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
      Text(text = title, style = MaterialTheme.typography.titleMedium)
      Text(text = if (granted) "Granted" else "Required")
      if (!granted) {
        Button(onClick = { context.startActivity(intent) }) {
          Text("Open settings")
        }
      }
    }
  }
}

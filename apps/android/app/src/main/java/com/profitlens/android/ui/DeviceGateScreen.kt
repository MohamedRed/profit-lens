package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.ActiveDeviceSnapshot
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner
import java.text.DateFormat

@Composable
fun DeviceGateScreen(
  status: DeviceGateStatus,
  message: String?,
  activeDevices: List<ActiveDeviceSnapshot>,
  currentDeviceId: String?,
  onReplace: (String) -> Unit,
  onRetry: () -> Unit,
  onSignOut: () -> Unit,
) {
  ScrollColumn(padding = androidx.compose.foundation.layout.PaddingValues()) {
    when (status) {
      DeviceGateStatus.LIMIT -> {
        SectionCard(
          title = "Replace an active device",
          subtitle = message ?: "This subscription already uses its active device limit.",
        ) {
          activeDevices.forEach { device ->
            SectionCard(
              title = if (device.deviceId == currentDeviceId) "This Android device" else (device.platform.ifBlank { "Active device" }),
              subtitle = buildString {
                append("Last seen ")
                append(device.lastSeen?.let(DateFormat::getDateTimeInstance)?.format(it) ?: "recently")
              },
            ) {
              if (device.deviceId != currentDeviceId) {
                Button(onClick = { onReplace(device.deviceId) }, modifier = Modifier.fillMaxWidth()) {
                  Text("Replace with this Android app")
                }
              }
            }
          }
          Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) {
            Text("Sign out")
          }
        }
      }

      DeviceGateStatus.ERROR -> {
        SectionCard(
          title = "We could not activate this device",
          subtitle = "Profit Lens needs one verified Android device before the app can continue.",
        ) {
          if (!message.isNullOrBlank()) {
            StatusBanner(message = message, tone = "error")
          }
          Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = onRetry, modifier = Modifier.fillMaxWidth()) {
              Text("Try again")
            }
            Button(onClick = onSignOut, modifier = Modifier.fillMaxWidth()) {
              Text("Sign out")
            }
          }
        }
      }

      else -> Unit
    }
  }
}

package com.profitlens.android.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.data.model.ActiveDeviceSnapshot
import com.profitlens.android.core.ui.AppListRow
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
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
            val lastSeenLabel = device.lastSeen?.let { DateFormat.getDateTimeInstance().format(it) } ?: "recently"
            AppListRow(
              title = if (device.deviceId == currentDeviceId) "This Android device" else (device.platform.ifBlank { "Active device" }),
              subtitle = "Last seen $lastSeenLabel",
              supporting = if (device.deviceId == currentDeviceId) "Current device" else null,
            )
            if (device.deviceId != currentDeviceId) {
              SecondaryButton(label = "Replace with this Android app", onClick = { onReplace(device.deviceId) })
            }
          }
          SecondaryButton(label = "Sign out", onClick = onSignOut)
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
            PrimaryButton(label = "Try again", onClick = onRetry)
            SecondaryButton(label = "Sign out", onClick = onSignOut)
          }
        }
      }

      else -> Unit
    }
  }
}

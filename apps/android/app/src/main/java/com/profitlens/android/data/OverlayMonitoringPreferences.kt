package com.profitlens.android.data

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class OverlayMonitoringPreferences(context: Context) {
  private val prefs = context.getSharedPreferences("profit_lens_monitoring", Context.MODE_PRIVATE)
  private val enabledFlow = MutableStateFlow(prefs.getBoolean(KEY_ENABLED, false))

  fun isEnabled(): Boolean = enabledFlow.value

  fun watchEnabled(): StateFlow<Boolean> = enabledFlow

  fun setEnabled(enabled: Boolean) {
    prefs.edit().putBoolean(KEY_ENABLED, enabled).apply()
    enabledFlow.value = enabled
  }

  private companion object {
    const val KEY_ENABLED = "overlay_enabled"
  }
}

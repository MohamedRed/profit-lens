package com.profitlens.android.data

import android.content.Context
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

@Singleton
class OverlayMonitoringPreferences @Inject constructor(
  @ApplicationContext context: Context,
) {
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

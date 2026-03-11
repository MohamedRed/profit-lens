package com.profitlens.android.data

import android.content.Context
import java.util.UUID

class ProfitLensDeviceIdStore(context: Context) {
  private val prefs = context.getSharedPreferences("profit_lens_device", Context.MODE_PRIVATE)

  fun getOrCreate(): String {
    val existing = prefs.getString(KEY_DEVICE_ID, null)
    if (!existing.isNullOrBlank()) {
      return existing
    }
    val created = UUID.randomUUID().toString()
    prefs.edit().putString(KEY_DEVICE_ID, created).apply()
    return created
  }

  private companion object {
    const val KEY_DEVICE_ID = "device_id"
  }
}

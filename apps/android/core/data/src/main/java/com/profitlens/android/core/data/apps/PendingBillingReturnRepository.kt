package com.profitlens.android.core.data.apps

import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@Singleton
class PendingBillingReturnRepository @Inject constructor() {
  private val pendingStatus = MutableStateFlow<String?>(null)

  fun watch(): StateFlow<String?> = pendingStatus.asStateFlow()

  fun submit(status: String?) {
    pendingStatus.value = status?.trim()?.takeIf { it.isNotEmpty() }
  }

  fun consume(): String? {
    val value = pendingStatus.value
    pendingStatus.value = null
    return value
  }
}

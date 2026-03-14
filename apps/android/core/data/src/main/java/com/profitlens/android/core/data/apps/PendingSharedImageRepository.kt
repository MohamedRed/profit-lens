package com.profitlens.android.core.data.apps

import android.net.Uri
import javax.inject.Inject
import javax.inject.Singleton
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

@Singleton
class PendingSharedImageRepository @Inject constructor() {
  private val pendingUri = MutableStateFlow<Uri?>(null)

  fun watch(): StateFlow<Uri?> = pendingUri.asStateFlow()

  fun submit(uri: Uri?) {
    pendingUri.value = uri
  }

  fun consume(): Uri? {
    val value = pendingUri.value
    pendingUri.value = null
    return value
  }
}

package com.profitlens.android.ui

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Build
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.profitlens.android.core.data.apps.PendingBillingReturnRepository
import com.profitlens.android.core.data.apps.PendingSharedImageRepository
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
  @Inject lateinit var pendingSharedImageRepository: PendingSharedImageRepository
  @Inject lateinit var pendingBillingReturnRepository: PendingBillingReturnRepository

  private val viewModel by viewModels<AppRootViewModel>()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleIntent(intent)
    setContent {
      val state by viewModel.uiState.collectAsStateWithLifecycle()
      ProfitLensApp(
        state = state,
        onReplaceDevice = viewModel::replaceActiveDevice,
        onRetryDeviceRegistration = viewModel::retryDeviceRegistration,
        onSignOut = viewModel::signOut,
        onMainTabChanged = viewModel::saveSelectedMainTab,
        onBillingStatusHandled = viewModel::consumePendingBillingStatus,
      )
    }
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleIntent(intent)
  }

  private fun handleIntent(intent: Intent?) {
    val currentIntent = intent ?: return
    extractSharedImage(currentIntent)?.let(pendingSharedImageRepository::submit)
    extractBillingStatus(currentIntent)?.let(pendingBillingReturnRepository::submit)
  }

  private fun extractSharedImage(intent: Intent): Uri? {
    val isImageShare = intent.action == Intent.ACTION_SEND && intent.type?.startsWith("image/") == true
    if (!isImageShare) {
      return null
    }
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
    } else {
      @Suppress("DEPRECATION")
      intent.getParcelableExtra(Intent.EXTRA_STREAM) as? Uri
    }
  }

  private fun extractBillingStatus(intent: Intent): String? {
    val data = intent.data ?: return null
    val isBillingReturn = data.host == "profit-lens-prod-2e417.web.app" &&
      data.path?.startsWith("/android-return/billing") == true
    return if (isBillingReturn) data.getQueryParameter("status") else null
  }
}

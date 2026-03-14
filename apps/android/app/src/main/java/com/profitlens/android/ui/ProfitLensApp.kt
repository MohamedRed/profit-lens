package com.profitlens.android.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.rememberNavController
import com.profitlens.android.core.ui.LoadingState
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.feature.auth.authGraph
import com.profitlens.android.feature.auth.loginRoute
import com.profitlens.android.feature.onboarding.onboardingGraph
import com.profitlens.android.feature.onboarding.onboardingRoute

@Composable
fun ProfitLensApp(
  state: AppRootState,
  onReplaceDevice: (String) -> Unit,
  onRetryDeviceRegistration: () -> Unit,
  onSignOut: () -> Unit,
  onMainTabChanged: (String) -> Unit,
  onBillingStatusHandled: () -> Unit,
) {
  com.profitlens.android.designsystem.ProfitLensTheme {
    when {
      !state.firebaseReady -> FirebaseRequiredScreen()
      state.loading -> ScrollColumn(padding = androidx.compose.foundation.layout.PaddingValues()) {
        LoadingState(label = "Loading your Android workspace…")
      }
      state.user == null -> {
        val navController = rememberNavController()
        NavHost(navController = navController, startDestination = loginRoute) {
          authGraph(navController)
        }
      }
      state.deviceGateStatus == DeviceGateStatus.LIMIT || state.deviceGateStatus == DeviceGateStatus.ERROR -> {
        DeviceGateScreen(
          status = state.deviceGateStatus,
          message = state.deviceGateMessage,
          activeDevices = state.activeDevices,
          currentDeviceId = state.currentDeviceId,
          onReplace = onReplaceDevice,
          onRetry = onRetryDeviceRegistration,
          onSignOut = onSignOut,
        )
      }
      state.onboardingRequired -> {
        val navController = rememberNavController()
        NavHost(navController = navController, startDestination = onboardingRoute) {
          onboardingGraph()
        }
      }
      else -> MainShell(
        selectedMainTab = state.selectedMainTab,
        pendingBillingStatus = state.pendingBillingStatus,
        onMainTabChanged = onMainTabChanged,
        onBillingStatusHandled = onBillingStatusHandled,
        onSignOut = onSignOut,
      )
    }
  }
}

@Composable
private fun FirebaseRequiredScreen() {
  ScrollColumn(padding = androidx.compose.foundation.layout.PaddingValues()) {
    SectionCard(
      title = "Android setup is incomplete",
      subtitle = "This build is missing the Firebase configuration needed to sign in and sync your account.",
    ) {}
  }
}

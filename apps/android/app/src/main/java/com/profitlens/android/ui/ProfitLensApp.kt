package com.profitlens.android.ui

import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable

@Composable
fun ProfitLensApp(
  state: OverlayMonitorUiState,
  onSignIn: (String, String) -> Unit,
  onSignOut: () -> Unit,
  onMonitoringChanged: (Boolean) -> Unit,
  onRefreshWorkspace: () -> Unit,
  onWorkspaceSignedOut: () -> Unit,
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
      HybridShellScaffold(
        state = state,
        onSignOut = onSignOut,
        onMonitoringChanged = onMonitoringChanged,
        onRefreshWorkspace = onRefreshWorkspace,
        onWorkspaceSignedOut = onWorkspaceSignedOut,
      )
    }
  }
}

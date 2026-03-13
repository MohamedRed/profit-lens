package com.profitlens.android.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Language
import androidx.compose.material.icons.outlined.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext

@Composable
fun HybridShellScaffold(
  state: OverlayMonitorUiState,
  onSignOut: () -> Unit,
  onMonitoringChanged: (Boolean) -> Unit,
  onRefreshWorkspace: () -> Unit,
  onWorkspaceSignedOut: () -> Unit,
) {
  val context = LocalContext.current
  var selectedTab by rememberSaveable { mutableStateOf(HybridShellTab.WORKSPACE) }

  LaunchedEffect(state.user?.uid) {
    if (state.user == null) {
      clearWorkspaceWebSession(context)
      selectedTab = HybridShellTab.OVERLAY
    } else {
      selectedTab = HybridShellTab.WORKSPACE
    }
  }

  Scaffold(
    modifier = Modifier.fillMaxSize(),
    bottomBar = {
      NavigationBar {
        NavigationBarItem(
          selected = selectedTab == HybridShellTab.WORKSPACE,
          onClick = { selectedTab = HybridShellTab.WORKSPACE },
          icon = { Icon(Icons.Outlined.Language, contentDescription = null) },
          label = { Text("Workspace") },
        )
        NavigationBarItem(
          selected = selectedTab == HybridShellTab.OVERLAY,
          onClick = { selectedTab = HybridShellTab.OVERLAY },
          icon = { Icon(Icons.Outlined.Tune, contentDescription = null) },
          label = { Text("Overlay") },
        )
      }
    },
  ) { innerPadding ->
    androidx.compose.foundation.layout.Box(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
      when (selectedTab) {
        HybridShellTab.WORKSPACE -> WorkspaceWebView(
          workspace = state.workspace,
          onRetry = onRefreshWorkspace,
          onWorkspaceSignedOut = onWorkspaceSignedOut,
        )
        HybridShellTab.OVERLAY -> OverlayMonitorScreen(
          state = state,
          onSignOut = onSignOut,
          onMonitoringChanged = onMonitoringChanged,
        )
      }
    }
  }
}

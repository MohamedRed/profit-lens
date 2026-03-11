package com.profitlens.android.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle

class MainActivity : ComponentActivity() {
  private val viewModel by viewModels<MainViewModel>()

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContent {
      val state by viewModel.uiState.collectAsStateWithLifecycle()
      ProfitLensApp(
        state = state,
        onSignIn = viewModel::signIn,
        onSignOut = viewModel::signOut,
        onMonitoringChanged = viewModel::setMonitoringEnabled,
      )
    }
  }
}

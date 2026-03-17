package com.profitlens.android.core.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun AppScaffold(
  snackbarHostState: SnackbarHostState,
  topBar: @Composable (() -> Unit)? = null,
  bottomBar: @Composable (() -> Unit)? = null,
  content: @Composable (PaddingValues) -> Unit,
) {
  Scaffold(
    containerColor = MaterialTheme.colorScheme.background,
    snackbarHost = { SnackbarHost(snackbarHostState) },
    topBar = { topBar?.invoke() },
    bottomBar = { bottomBar?.invoke() },
  ) { padding ->
    content(padding)
  }
}

@Composable
fun ScrollColumn(
  padding: PaddingValues,
  content: @Composable ColumnScope.() -> Unit,
) {
  Column(
    modifier = Modifier
      .fillMaxSize()
      .padding(padding)
      .verticalScroll(rememberScrollState())
      .padding(horizontal = 16.dp, vertical = 20.dp),
    verticalArrangement = Arrangement.spacedBy(16.dp),
  ) {
    content()
  }
}

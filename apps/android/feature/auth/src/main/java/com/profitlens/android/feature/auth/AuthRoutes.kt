package com.profitlens.android.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SectionCard
import com.profitlens.android.core.ui.StatusBanner

const val loginRoute = "auth/login"
const val registerRoute = "auth/register"

fun NavGraphBuilder.authGraph(navController: NavController) {
  composable(loginRoute) {
    val viewModel: AuthViewModel = hiltViewModel()
    val state by viewModel.loginState.collectAsStateWithLifecycle()
    AuthScreen(
      title = "Welcome back",
      subtitle = "Sign in to continue to Profit Lens.",
      state = state,
      primaryLabel = "Sign in",
      secondaryLabel = "Create account",
      onEmailChanged = viewModel::updateLoginEmail,
      onPasswordChanged = viewModel::updateLoginPassword,
      onPrimary = viewModel::signIn,
      onSecondary = { navController.navigate(registerRoute) },
    )
  }
  composable(registerRoute) {
    val viewModel: AuthViewModel = hiltViewModel()
    val state by viewModel.registerState.collectAsStateWithLifecycle()
    AuthScreen(
      title = "Create your account",
      subtitle = "Start using the full Android app.",
      state = state,
      primaryLabel = "Create account",
      secondaryLabel = "Already have an account?",
      onEmailChanged = viewModel::updateRegisterEmail,
      onPasswordChanged = viewModel::updateRegisterPassword,
      onPrimary = viewModel::register,
      onSecondary = { navController.popBackStack() },
    )
  }
}

@Composable
private fun AuthScreen(
  title: String,
  subtitle: String,
  state: AuthScreenState,
  primaryLabel: String,
  secondaryLabel: String,
  onEmailChanged: (String) -> Unit,
  onPasswordChanged: (String) -> Unit,
  onPrimary: () -> Unit,
  onSecondary: () -> Unit,
) {
  ScrollColumn(padding = androidx.compose.foundation.layout.PaddingValues()) {
    SectionCard(title = title, subtitle = subtitle) {
      Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        OutlinedTextField(
          value = state.email,
          onValueChange = onEmailChanged,
          modifier = Modifier.fillMaxWidth(),
          label = { Text("Email") },
          singleLine = true,
        )
        OutlinedTextField(
          value = state.password,
          onValueChange = onPasswordChanged,
          modifier = Modifier.fillMaxWidth(),
          label = { Text("Password") },
          singleLine = true,
        )
        Button(
          onClick = onPrimary,
          enabled = !state.submitting,
          modifier = Modifier.fillMaxWidth(),
        ) {
          Text(if (state.submitting) "Working..." else primaryLabel)
        }
        Button(
          onClick = onSecondary,
          enabled = !state.submitting,
          modifier = Modifier.fillMaxWidth(),
        ) {
          Text(secondaryLabel)
        }
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "error") }
  }
}

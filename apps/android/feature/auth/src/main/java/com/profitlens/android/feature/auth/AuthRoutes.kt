package com.profitlens.android.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
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
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
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
        AppTextField(
          value = state.email,
          onValueChange = onEmailChanged,
          label = "Email",
          singleLine = true,
        )
        AppTextField(
          value = state.password,
          onValueChange = onPasswordChanged,
          label = "Password",
          singleLine = true,
        )
        PrimaryButton(
          label = if (state.submitting) "Working..." else primaryLabel,
          onClick = onPrimary,
          enabled = !state.submitting,
        )
        SecondaryButton(
          label = secondaryLabel,
          onClick = onSecondary,
          enabled = !state.submitting,
        )
      }
    }
    state.message?.let { StatusBanner(message = it, tone = "error") }
  }
}

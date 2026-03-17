package com.profitlens.android.feature.auth

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavController
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val loginRoute = "auth/login"
const val registerRoute = "auth/register"

fun NavGraphBuilder.authGraph(navController: NavController) {
  composable(loginRoute) {
    val viewModel: AuthViewModel = hiltViewModel()
    val state by viewModel.loginState.collectAsStateWithLifecycle()
    LoginScreen(
      state = state,
      onEmailChanged = viewModel::updateLoginEmail,
      onPasswordChanged = viewModel::updateLoginPassword,
      onSignIn = viewModel::signIn,
      onCreateAccount = { navController.navigate(registerRoute) },
    )
  }
  composable(registerRoute) {
    val viewModel: AuthViewModel = hiltViewModel()
    val state by viewModel.registerState.collectAsStateWithLifecycle()
    RegisterScreen(
      state = state,
      onEmailChanged = viewModel::updateRegisterEmail,
      onPasswordChanged = viewModel::updateRegisterPassword,
      onCreateAccount = viewModel::register,
      onSignIn = { navController.popBackStack() },
    )
  }
}

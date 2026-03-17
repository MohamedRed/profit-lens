package com.profitlens.android.feature.onboarding

import androidx.compose.runtime.getValue
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraphBuilder
import androidx.navigation.compose.composable

const val onboardingRoute = "onboarding"

fun NavGraphBuilder.onboardingGraph() {
  composable(onboardingRoute) {
    val viewModel: OnboardingViewModel = hiltViewModel()
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    OnboardingScreen(
      state = state,
      onStepSelected = viewModel::setStep,
      onNext = {
        if (state.step < 2) {
          viewModel.setStep(state.step + 1)
        } else {
          viewModel.finish()
        }
      },
      onBack = { viewModel.setStep(state.step - 1) },
      onVehicleChanged = viewModel::updateVehicle,
      onProfileChanged = viewModel::updateProfile,
    )
  }
}

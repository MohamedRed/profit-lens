package com.profitlens.android

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performTextInput
import androidx.compose.ui.test.performTextReplacement
import com.profitlens.android.core.data.model.createVehicleDraft
import com.profitlens.android.core.data.model.defaultUserProfile
import com.profitlens.android.designsystem.ProfitLensTheme
import com.profitlens.android.feature.auth.AuthScreenState
import com.profitlens.android.feature.auth.LoginScreen
import com.profitlens.android.feature.auth.RegisterScreen
import com.profitlens.android.feature.onboarding.OnboardingScreen
import com.profitlens.android.feature.onboarding.OnboardingState
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class AuthOnboardingComposeTest {
  @get:Rule
  val composeRule = createComposeRule()

  @Test
  fun authFlow_editsCredentialsAndSwitchesBetweenLoginAndRegister() {
    var loginState by mutableStateOf(AuthScreenState())
    var screen by mutableStateOf("login")
    var signInClicks = 0
    var registerClicks = 0

    composeRule.setContent {
      ProfitLensTheme {
        if (screen == "login") {
          LoginScreen(
            state = loginState,
            onEmailChanged = { loginState = loginState.copy(email = it) },
            onPasswordChanged = { loginState = loginState.copy(password = it) },
            onSignIn = { signInClicks += 1 },
            onCreateAccount = { screen = "register" },
          )
        } else {
          RegisterScreen(
            state = loginState,
            onEmailChanged = { loginState = loginState.copy(email = it) },
            onPasswordChanged = { loginState = loginState.copy(password = it) },
            onCreateAccount = { registerClicks += 1 },
            onSignIn = { screen = "login" },
          )
        }
      }
    }

    composeRule.onNodeWithText("Welcome back").assertIsDisplayed()
    composeRule.onNodeWithTag("field:Email").performTextInput("driver@example.test")
    composeRule.onNodeWithTag("field:Password").performTextInput("secure-password")
    composeRule.onNodeWithTag("button:Sign in").performClick()
    assertEquals("driver@example.test", loginState.email)
    assertEquals("secure-password", loginState.password)
    assertEquals(1, signInClicks)

    composeRule.onNodeWithTag("button:Create account →").performClick()
    composeRule.onNodeWithText("Start your workspace").assertIsDisplayed()
    composeRule.onNodeWithTag("button:Create account").performClick()
    assertEquals(1, registerClicks)

    composeRule.onNodeWithTag("button:Already have an account? →").performClick()
    composeRule.onNodeWithText("Welcome back").assertIsDisplayed()
  }

  @Test
  fun onboardingFlow_collectsVehicleCostAndBusinessSetupBeforeFinish() {
    var state by mutableStateOf(
      OnboardingState(
        profile = defaultUserProfile("user-1", "driver@example.test").copy(monthlyDeliveries = 0),
        vehicle = createVehicleDraft(),
      ),
    )
    var finishClicks = 0

    composeRule.setContent {
      ProfitLensTheme {
        OnboardingScreen(
          state = state,
          onStepSelected = { state = state.copy(step = it) },
          onNext = {
            if (state.step < 2) state = state.copy(step = state.step + 1) else finishClicks += 1
          },
          onBack = { state = state.copy(step = (state.step - 1).coerceAtLeast(0)) },
          onVehicleChanged = { transform -> state = state.copy(vehicle = transform(state.vehicle)) },
          onProfileChanged = { transform -> state = state.copy(profile = state.profile?.let(transform)) },
        )
      }
    }

    composeRule.onNodeWithText("Finish setup").assertIsDisplayed()
    composeRule.onNodeWithText("Add your vehicle").assertIsDisplayed()
    composeRule.onNodeWithTag("field:Vehicle name").performTextInput("Courier bike")
    composeRule.onNodeWithTag("button:Next").performClick()

    composeRule.onNodeWithText("Enter operating costs").assertIsDisplayed()
    composeRule.onNodeWithTag("field:Consumption / 100km").performTextInput("5.8")
    composeRule.onNodeWithTag("button:Next").performClick()

    composeRule.onNodeWithText("Confirm your business targets").assertIsDisplayed()
    composeRule.onNodeWithTag("field:Monthly deliveries").performTextReplacement("180")
    composeRule.onNodeWithTag("button:Finish setup").performClick()

    assertEquals("Courier bike", state.vehicle.name)
    assertEquals("5.8", state.vehicle.energyConsumptionPer100Km)
    assertEquals(180, state.profile?.monthlyDeliveries)
    assertEquals(1, finishClicks)
  }
}

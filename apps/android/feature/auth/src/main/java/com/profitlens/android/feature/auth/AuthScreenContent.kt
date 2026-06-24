package com.profitlens.android.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.profitlens.android.core.ui.AppTextField
import com.profitlens.android.core.ui.PrimaryButton
import com.profitlens.android.core.ui.ScrollColumn
import com.profitlens.android.core.ui.SecondaryButton
import com.profitlens.android.core.ui.StatusBanner

@Composable
fun LoginScreen(
  state: AuthScreenState,
  onEmailChanged: (String) -> Unit,
  onPasswordChanged: (String) -> Unit,
  onSignIn: () -> Unit,
  onCreateAccount: () -> Unit,
) {
  AuthScreenFrame(
    badge = "Profit Lens",
    title = "Welcome back",
    subtitle = "Sign in to keep analyzing offers from your Android workspace.",
    state = state,
    primaryLabel = "Sign in",
    secondaryLabel = "Create account →",
    onEmailChanged = onEmailChanged,
    onPasswordChanged = onPasswordChanged,
    onPrimary = onSignIn,
    onSecondary = onCreateAccount,
  )
}

@Composable
fun RegisterScreen(
  state: AuthScreenState,
  onEmailChanged: (String) -> Unit,
  onPasswordChanged: (String) -> Unit,
  onCreateAccount: () -> Unit,
  onSignIn: () -> Unit,
) {
  AuthScreenFrame(
    badge = "Create account",
    title = "Start your workspace",
    subtitle = "Use the same Profit Lens account across Android and web.",
    state = state,
    primaryLabel = "Create account",
    secondaryLabel = "Already have an account? →",
    onEmailChanged = onEmailChanged,
    onPasswordChanged = onPasswordChanged,
    onPrimary = onCreateAccount,
    onSecondary = onSignIn,
  )
}

@Composable
private fun AuthScreenFrame(
  badge: String,
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
  ScrollColumn(padding = PaddingValues()) {
    Card(
      shape = MaterialTheme.shapes.large,
      colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    ) {
      Column(
        modifier = Modifier.padding(horizontal = 18.dp, vertical = 22.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
      ) {
        BrandHeader(badge = badge, title = title, subtitle = subtitle)
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
        }
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

@Composable
private fun BrandHeader(
  badge: String,
  title: String,
  subtitle: String,
) {
  Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
    Box(
      modifier = Modifier
        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.16f), CircleShape)
        .padding(10.dp),
      contentAlignment = Alignment.Center,
    ) {
      Box(
        modifier = Modifier
          .background(MaterialTheme.colorScheme.primary, CircleShape)
          .padding(9.dp),
      )
    }
    Text(
      text = badge,
      style = MaterialTheme.typography.labelMedium,
      color = MaterialTheme.colorScheme.primary,
      modifier = Modifier
        .background(MaterialTheme.colorScheme.primary.copy(alpha = 0.12f), MaterialTheme.shapes.medium)
        .padding(horizontal = 12.dp, vertical = 6.dp),
    )
    Column(verticalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.fillMaxWidth()) {
      Text(text = title, style = MaterialTheme.typography.headlineMedium, color = MaterialTheme.colorScheme.onSurface)
      Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
  }
}

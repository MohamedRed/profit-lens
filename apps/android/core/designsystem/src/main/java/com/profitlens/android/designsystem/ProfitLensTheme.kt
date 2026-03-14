package com.profitlens.android.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightScheme = lightColorScheme(
  primary = ProfitLensColors.Navy,
  onPrimary = ProfitLensColors.Cream,
  secondary = ProfitLensColors.Sky,
  background = ProfitLensColors.Cream,
  surface = ProfitLensColors.Surface,
  surfaceVariant = ProfitLensColors.SurfaceVariant,
  onSurface = ProfitLensColors.Ink,
  onSurfaceVariant = ProfitLensColors.Slate,
  error = ProfitLensColors.Alert,
)

private val DarkScheme = darkColorScheme(
  primary = ProfitLensColors.Sky,
  onPrimary = ProfitLensColors.Ink,
  secondary = ProfitLensColors.Sand,
  background = ProfitLensColors.Ink,
  surface = ProfitLensColors.Charcoal,
  surfaceVariant = ProfitLensColors.Slate,
  onSurface = ProfitLensColors.Cream,
  onSurfaceVariant = ProfitLensColors.Sand,
  error = ProfitLensColors.AlertSoft,
)

@Composable
fun ProfitLensTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = if (darkTheme) DarkScheme else LightScheme,
    typography = ProfitLensTypography,
    content = content,
  )
}

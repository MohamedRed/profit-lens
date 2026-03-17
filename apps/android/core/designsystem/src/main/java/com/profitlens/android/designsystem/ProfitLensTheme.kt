package com.profitlens.android.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightScheme = lightColorScheme(
  primary = ProfitLensColors.Purple,
  onPrimary = ProfitLensColors.Surface,
  primaryContainer = ProfitLensColors.PurpleSoft,
  onPrimaryContainer = ProfitLensColors.TextPrimary,
  secondary = ProfitLensColors.Teal,
  onSecondary = ProfitLensColors.Surface,
  secondaryContainer = ProfitLensColors.SuccessSoft,
  onSecondaryContainer = ProfitLensColors.TextPrimary,
  tertiary = ProfitLensColors.Pink,
  onTertiary = ProfitLensColors.Surface,
  tertiaryContainer = ProfitLensColors.PurpleSurface,
  onTertiaryContainer = ProfitLensColors.TextPrimary,
  background = ProfitLensColors.Background,
  onBackground = ProfitLensColors.TextPrimary,
  surface = ProfitLensColors.Surface,
  surfaceVariant = ProfitLensColors.SurfaceMuted,
  onSurface = ProfitLensColors.TextPrimary,
  onSurfaceVariant = ProfitLensColors.TextSecondary,
  outline = ProfitLensColors.Outline,
  error = ProfitLensColors.Danger,
  onError = ProfitLensColors.Surface,
  errorContainer = ProfitLensColors.DangerSoft,
  onErrorContainer = ProfitLensColors.TextPrimary,
)

private val DarkScheme = darkColorScheme(
  primary = ProfitLensColors.Purple,
  onPrimary = ProfitLensColors.Surface,
  primaryContainer = ProfitLensColors.PurpleSoft,
  onPrimaryContainer = ProfitLensColors.Surface,
  secondary = ProfitLensColors.Teal,
  onSecondary = ProfitLensColors.TextPrimary,
  secondaryContainer = ProfitLensColors.SuccessSoft,
  onSecondaryContainer = ProfitLensColors.Surface,
  tertiary = ProfitLensColors.Pink,
  onTertiary = ProfitLensColors.TextPrimary,
  tertiaryContainer = ProfitLensColors.PurpleSurface,
  onTertiaryContainer = ProfitLensColors.Surface,
  background = Color(0xFF141419),
  onBackground = ProfitLensColors.Surface,
  surface = Color(0xFF1D1D23),
  surfaceVariant = Color(0xFF2A2A31),
  onSurface = ProfitLensColors.Surface,
  onSurfaceVariant = Color(0xFFBDBDC7),
  outline = Color(0xFF3E3E48),
  error = ProfitLensColors.Danger,
  onError = ProfitLensColors.Surface,
  errorContainer = ProfitLensColors.DangerSoft,
  onErrorContainer = ProfitLensColors.Surface,
)

@Composable
fun ProfitLensTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  MaterialTheme(
    colorScheme = if (darkTheme) DarkScheme else LightScheme,
    typography = ProfitLensTypography,
    shapes = ProfitLensShapes,
    content = content,
  )
}

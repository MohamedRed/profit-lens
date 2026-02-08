import 'package:flutter/material.dart';

import 'shadcn_tokens.dart';
import 'shadcn_typography.dart';

class ShadcnTheme {
  const ShadcnTheme._();

  static ThemeData light() {
    const scheme = ColorScheme(
      brightness: Brightness.light,
      primary: ShadcnColors.purple,
      onPrimary: Colors.white,
      secondary: ShadcnColors.teal,
      onSecondary: Colors.white,
      tertiary: ShadcnColors.pink,
      onTertiary: Colors.white,
      error: Color(0xFFEF4444),
      onError: Colors.white,
      background: ShadcnColors.background,
      onBackground: ShadcnColors.textPrimary,
      surface: ShadcnColors.surface,
      onSurface: ShadcnColors.textPrimary,
      surfaceTint: ShadcnColors.purple,
    );

    final textTheme = ShadcnTypography.textTheme(scheme);

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: ShadcnColors.background,
      pageTransitionsTheme: const PageTransitionsTheme(
        builders: {
          TargetPlatform.android: ZoomPageTransitionsBuilder(),
          TargetPlatform.iOS: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.macOS: FadeUpwardsPageTransitionsBuilder(),
          TargetPlatform.linux: ZoomPageTransitionsBuilder(),
          TargetPlatform.windows: ZoomPageTransitionsBuilder(),
        },
      ),
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: ShadcnColors.textPrimary,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        color: ShadcnColors.surface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          borderSide: const BorderSide(color: ShadcnColors.outline),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          borderSide: const BorderSide(color: ShadcnColors.outline),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          borderSide: const BorderSide(color: ShadcnColors.purple, width: 2),
        ),
        fillColor: ShadcnColors.surface,
        filled: true,
        hintStyle: textTheme.bodyMedium?.copyWith(
          color: ShadcnColors.textMuted,
        ),
      ),
      segmentedButtonTheme: SegmentedButtonThemeData(
        style: ButtonStyle(
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return Colors.white;
            }
            return ShadcnColors.surface;
          }),
          side: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return const BorderSide(color: Colors.transparent);
            }
            return const BorderSide(color: ShadcnColors.outline);
          }),
          shape: WidgetStateProperty.all(
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)),
          ),
          textStyle: WidgetStateProperty.all(
            textTheme.labelLarge?.copyWith(color: ShadcnColors.textPrimary),
          ),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.selected)) {
              return ShadcnColors.textPrimary;
            }
            return ShadcnColors.textSecondary;
          }),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          minimumSize: const Size.fromHeight(48),
          textStyle: textTheme.labelLarge,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 12),
          minimumSize: const Size.fromHeight(48),
          textStyle: textTheme.labelLarge?.copyWith(
            color: ShadcnColors.textPrimary,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(ShadcnRadius.lg),
          ),
          side: const BorderSide(color: ShadcnColors.outline),
        ),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        backgroundColor: ShadcnColors.surface,
        selectedColor: ShadcnColors.purple.withOpacity(.12),
        labelStyle: textTheme.labelMedium,
        side: const BorderSide(color: Colors.transparent),
      ),
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        elevation: 0,
        indicatorShape: const StadiumBorder(),
        indicatorColor: Colors.white,
        labelTextStyle: WidgetStateProperty.all(
          textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
        ),
      ),
      dividerTheme: const DividerThemeData(color: ShadcnColors.outline),
    );
  }
}

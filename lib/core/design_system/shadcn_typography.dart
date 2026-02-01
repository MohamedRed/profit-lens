import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import 'shadcn_tokens.dart';

class ShadcnTypography {
  static TextTheme textTheme(ColorScheme scheme) {
    final inter = GoogleFonts.interTextTheme();
    final plusJakarta = GoogleFonts.plusJakartaSans();

    return inter.copyWith(
      displayLarge: plusJakarta.copyWith(
        fontSize: 36,
        fontWeight: FontWeight.w700,
        color: ShadcnColors.textPrimary,
        height: 1.1,
      ),
      displayMedium: plusJakarta.copyWith(
        fontSize: 32,
        fontWeight: FontWeight.w700,
        color: ShadcnColors.textPrimary,
      ),
      headlineSmall: plusJakarta.copyWith(
        fontSize: 22,
        fontWeight: FontWeight.w700,
        color: ShadcnColors.textPrimary,
      ),
      titleMedium: plusJakarta.copyWith(
        fontSize: 18,
        fontWeight: FontWeight.w700,
        color: ShadcnColors.textPrimary,
      ),
      titleSmall: inter.titleSmall?.copyWith(
        fontWeight: FontWeight.w600,
        color: ShadcnColors.textPrimary,
      ),
      bodyLarge: inter.bodyLarge?.copyWith(
        color: ShadcnColors.textSecondary,
        height: 1.4,
      ),
      bodyMedium: inter.bodyMedium?.copyWith(
        color: ShadcnColors.textSecondary,
        height: 1.4,
      ),
      labelLarge: inter.labelLarge?.copyWith(
        fontWeight: FontWeight.w600,
        color: scheme.onPrimary,
      ),
      labelMedium: inter.labelMedium?.copyWith(
        fontWeight: FontWeight.w600,
        color: ShadcnColors.textSecondary,
      ),
    );
  }
}

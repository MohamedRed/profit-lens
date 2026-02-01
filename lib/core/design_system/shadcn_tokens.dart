import 'package:flutter/material.dart';

/// Mobile-3 Minimal Vibrant palette + spatial tokens extracted from the
/// Pencil references. Keeping them centralized lets us style screens without
/// duplicating magic numbers everywhere.
class ShadcnColors {
  static const Color background = Color(0xFFFFFFFF);
  static const Color surface = Color(0xFFF4F4F5);
  static const Color surfaceElevated = Color(0xFFE4E4E7);
  static const Color outline = Color(0xFFD4D4D8);
  static const Color overlay = Color(0xFFFFFFFF);

  static const Color textPrimary = Color(0xFF18181B);
  static const Color textSecondary = Color(0xFF71717A);
  static const Color textMuted = Color(0xFFD4D4D8);

  static const Color purple = Color(0xFF8B5CF6);
  static const Color teal = Color(0xFF14B8A6);
  static const Color pink = Color(0xFFF472B6);
}

class ShadcnSpacing {
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 20;
  static const double xxl = 24;
  static const double section = 32;
}

class ShadcnRadius {
  static const double sm = 14;
  static const double md = 18;
  static const double lg = 20;
  static const double xl = 24;
  static const double xxl = 26;
  static const double pill = 100;
}

class ShadcnDurations {
  static const Duration short = Duration(milliseconds: 200);
  static const Duration medium = Duration(milliseconds: 300);
}

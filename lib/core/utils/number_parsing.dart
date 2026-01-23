class NumberParsing {
  static double? parseDouble(String value) {
    final sanitized = value.trim().replaceAll(',', '.');
    if (sanitized.isEmpty) {
      return null;
    }
    return double.tryParse(sanitized);
  }
}

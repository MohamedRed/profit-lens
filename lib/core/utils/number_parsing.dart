class NumberParsing {
  static double? parseDouble(String value) {
    final sanitized = value.trim().replaceAll(',', '.');
    if (sanitized.isEmpty) {
      return null;
    }
    return double.tryParse(sanitized);
  }

  static int? parseInt(String value) {
    final sanitized = value.trim();
    if (sanitized.isEmpty) {
      return null;
    }
    return int.tryParse(sanitized);
  }
}

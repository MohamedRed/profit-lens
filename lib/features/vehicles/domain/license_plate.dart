final _sivPattern = RegExp(r'^[A-Z]{2}\d{3}[A-Z]{2}$');
final _fniPattern = RegExp(r'^\d{1,3}[A-Z]{1,3}\d{2}$');

String normalizeFrenchLicensePlate(String value) {
  return value.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
}

String formatFrenchLicensePlate(String value) {
  final normalized = normalizeFrenchLicensePlate(value);
  if (_sivPattern.hasMatch(normalized)) {
    return '${normalized.substring(0, 2)}-'
        '${normalized.substring(2, 5)}-'
        '${normalized.substring(5)}';
  }
  return normalized;
}

bool isValidFrenchLicensePlate(String value) {
  final normalized = normalizeFrenchLicensePlate(value);
  return _sivPattern.hasMatch(normalized) || _fniPattern.hasMatch(normalized);
}

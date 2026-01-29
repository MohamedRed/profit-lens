class RouteVerification {
  final double distanceKm;
  final double durationMinutes;
  final String provider;
  final String travelMode;
  final DateTime verifiedAt;

  const RouteVerification({
    required this.distanceKm,
    required this.durationMinutes,
    required this.provider,
    required this.travelMode,
    required this.verifiedAt,
  });
}

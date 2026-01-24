class Offer {
  final double payoutEuro;
  final double distanceKm;
  final double? durationMinutes;
  final String? pickupName;
  final String? pickupAddress;
  final String? dropoffAddress;

  const Offer({
    required this.payoutEuro,
    required this.distanceKm,
    this.durationMinutes,
    this.pickupName,
    this.pickupAddress,
    this.dropoffAddress,
  });
}

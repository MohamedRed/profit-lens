class OfferInput {
  final double payoutEuro;
  final double? distanceKm;
  final double? durationMinutes;
  final String? pickupName;
  final String? pickupAddress;
  final String? dropoffName;
  final String? dropoffAddress;

  const OfferInput({
    required this.payoutEuro,
    this.distanceKm,
    this.durationMinutes,
    this.pickupName,
    this.pickupAddress,
    this.dropoffName,
    this.dropoffAddress,
  });
}

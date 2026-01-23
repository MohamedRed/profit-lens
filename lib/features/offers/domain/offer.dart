class Offer {
  final double payoutEuro;
  final double distanceKm;
  final String? pickupName;
  final String? pickupAddress;

  const Offer({
    required this.payoutEuro,
    required this.distanceKm,
    this.pickupName,
    this.pickupAddress,
  });
}

class PlaceSelection {
  final String placeId;
  final String? formattedAddress;
  final double? latitude;
  final double? longitude;

  const PlaceSelection({
    required this.placeId,
    this.formattedAddress,
    this.latitude,
    this.longitude,
  });
}

class PlaceSelection {
  final String placeId;
  final String? name;
  final String? formattedAddress;
  final double? latitude;
  final double? longitude;

  const PlaceSelection({
    required this.placeId,
    this.name,
    this.formattedAddress,
    this.latitude,
    this.longitude,
  });
}

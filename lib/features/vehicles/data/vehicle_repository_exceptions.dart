class VehiclePlateAlreadyExistsException implements Exception {
  final String? plate;

  VehiclePlateAlreadyExistsException({this.plate});

  @override
  String toString() =>
      'VehiclePlateAlreadyExistsException(plate: ${plate ?? "unknown"})';
}

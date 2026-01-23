import '../../offers/domain/offer.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'cost_settings.dart';

class ProfitabilityInput {
  final Offer offer;
  final VehicleProfile vehicle;
  final CostSettings costs;

  const ProfitabilityInput({
    required this.offer,
    required this.vehicle,
    required this.costs,
  });
}

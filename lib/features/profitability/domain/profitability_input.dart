import '../../offers/domain/offer.dart';
import '../../vehicles/domain/vehicle_profile.dart';

class CostSettings {
  final double energyPricePerUnit;
  final double socialContributionRate;

  const CostSettings({
    required this.energyPricePerUnit,
    required this.socialContributionRate,
  });
}

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

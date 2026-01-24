import 'package:flutter_test/flutter_test.dart';
import 'package:profit_lens/features/offers/domain/offer.dart';
import 'package:profit_lens/features/profitability/domain/profitability_engine.dart';
import 'package:profit_lens/features/profitability/domain/cost_settings.dart';
import 'package:profit_lens/features/profitability/domain/profitability_input.dart';
import 'package:profit_lens/features/profile/domain/fixed_cost_allocation.dart';
import 'package:profit_lens/features/vehicles/domain/energy_type.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_profile.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_type.dart';

void main() {
  test('computes profitability breakdown', () {
    final engine = ProfitabilityEngine();
    final offer = Offer(payoutEuro: 10, distanceKm: 5);
    final vehicle = VehicleProfile(
      id: 'test',
      name: 'Test bike',
      brand: null,
      model: null,
      type: VehicleType.ebike,
      energyType: EnergyType.electric,
      energyConsumptionPer100Km: 5,
      energyPricePerUnit: 0.2,
      maintenancePerKm: 0.05,
      depreciationPerKm: 0.02,
    );
    final costs = CostSettings(
      socialContributionRate: 0.2,
      incomeTaxRate: null,
      fixedCostAllocation: FixedCostAllocation.perKm,
      monthlyFixedCosts: 0,
      monthlyWorkingHours: 0,
      monthlyDistanceKm: 0,
      monthlyDeliveries: 0,
    );

    final breakdown = engine.evaluate(
      ProfitabilityInput(offer: offer, vehicle: vehicle, costs: costs),
    );

    expect(breakdown.energyCost, closeTo(0.05, 0.0001));
    expect(breakdown.maintenanceCost, closeTo(0.25, 0.0001));
    expect(breakdown.depreciationCost, closeTo(0.1, 0.0001));
    expect(breakdown.socialContributions, closeTo(2, 0.0001));
    expect(breakdown.netProfit, closeTo(7.6, 0.0001));
  });
}

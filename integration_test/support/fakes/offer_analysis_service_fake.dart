import 'package:image_picker/image_picker.dart';
import 'package:profit_lens/features/offers/data/offer_analysis_service.dart';
import 'package:profit_lens/features/offers/domain/offer.dart';
import 'package:profit_lens/features/offers/domain/offer_record.dart';
import 'package:profit_lens/features/offers/domain/offer_source.dart';
import 'package:profit_lens/features/profile/domain/fixed_cost_allocation.dart';
import 'package:profit_lens/features/profile/domain/user_profile.dart';
import 'package:profit_lens/features/profitability/domain/cost_breakdown.dart';
import 'package:profit_lens/features/profitability/domain/cost_settings.dart';
import 'package:profit_lens/features/vehicles/domain/vehicle_profile.dart';

class FakeOfferAnalysisService implements OfferAnalysisService {
  final UserProfile profile;
  final VehicleProfile vehicle;
  final Map<String, Offer> offersByImageName;

  FakeOfferAnalysisService({
    required this.profile,
    required this.vehicle,
    Map<String, Offer>? offersByImageName,
  }) : offersByImageName = offersByImageName ?? const {};

  @override
  Future<OfferRecord> analyzeOffer({
    Offer? offer,
    XFile? image,
    String? vehicleId,
    OfferSource? source,
  }) async {
    final resolvedOffer = _resolveOffer(offer, image);
    final costSettings = _buildCostSettings(profile);
    final breakdown = _buildBreakdown(
      offer: resolvedOffer,
      costs: costSettings,
      vehicle: vehicle,
    );
    return OfferRecord(
      id: 'test-offer-record',
      offer: resolvedOffer,
      source: source ?? _resolveSource(offer: offer, image: image),
      createdAt: DateTime.now(),
      vehicleSnapshot: vehicle,
      costSnapshot: costSettings,
      breakdown: breakdown,
      extraction: null,
    );
  }

  OfferSource _resolveSource({Offer? offer, XFile? image}) {
    if (offer != null) {
      return OfferSource.manual;
    }
    if (image != null) {
      return OfferSource.screenshot;
    }
    return OfferSource.manual;
  }

  Offer _resolveOffer(Offer? offer, XFile? image) {
    if (offer != null) {
      return offer;
    }
    if (image == null) {
      throw StateError('Missing offer or image for analysis.');
    }
    final name = image.path.split('/').last;
    final resolved = offersByImageName[name];
    if (resolved == null) {
      throw StateError('Missing fixture for image: $name');
    }
    return resolved;
  }

  CostSettings _buildCostSettings(UserProfile profile) {
    return CostSettings(
      socialContributionRate: profile.socialContributionRate,
      incomeTaxRate: profile.incomeTaxRate,
      fixedCostAllocation: profile.fixedCostAllocation,
      monthlyFixedCosts: profile.monthlyFixedCosts,
      monthlyWorkingHours: profile.monthlyWorkingHours,
      monthlyDistanceKm: profile.monthlyDistanceKm,
      monthlyDeliveries: profile.monthlyDeliveries,
    );
  }

  CostBreakdown _buildBreakdown({
    required Offer offer,
    required CostSettings costs,
    required VehicleProfile vehicle,
  }) {
    final distance = offer.routeVerification?.distanceKm ?? offer.distanceKm;
    final energyCost = distance *
        (vehicle.energyConsumptionPer100Km / 100) *
        vehicle.energyPricePerUnit;
    final maintenanceCost = distance * vehicle.maintenancePerKm;
    final depreciationCost = distance * vehicle.depreciationPerKm;
    final socialContributions = offer.payoutEuro * costs.socialContributionRate;
    final incomeTax = offer.payoutEuro * (costs.incomeTaxRate ?? 0);
    final fixedCostAllocation = _fixedCostAllocation(
      offer: offer,
      costs: costs,
    );
    final totalCosts = energyCost +
        maintenanceCost +
        depreciationCost +
        socialContributions +
        incomeTax +
        fixedCostAllocation;
    final netProfit = offer.payoutEuro - totalCosts;
    return CostBreakdown(
      energyCost: energyCost,
      maintenanceCost: maintenanceCost,
      depreciationCost: depreciationCost,
      socialContributions: socialContributions,
      incomeTax: incomeTax,
      fixedCostAllocation: fixedCostAllocation,
      totalCosts: totalCosts,
      netProfit: netProfit,
    );
  }

  double _fixedCostAllocation({
    required Offer offer,
    required CostSettings costs,
  }) {
    if (costs.monthlyFixedCosts <= 0) {
      return 0;
    }
    switch (costs.fixedCostAllocation) {
      case FixedCostAllocation.perHour:
        final durationMinutes =
            offer.routeVerification?.durationMinutes ?? offer.durationMinutes;
        if (durationMinutes == null || durationMinutes <= 0) {
          return 0;
        }
        if (costs.monthlyWorkingHours <= 0) {
          return 0;
        }
        return (costs.monthlyFixedCosts / costs.monthlyWorkingHours) *
            (durationMinutes / 60);
      case FixedCostAllocation.perKm:
        if (costs.monthlyDistanceKm <= 0) {
          return 0;
        }
        return (costs.monthlyFixedCosts / costs.monthlyDistanceKm) *
            offer.distanceKm;
      case FixedCostAllocation.perDelivery:
        if (costs.monthlyDeliveries <= 0) {
          return 0;
        }
        return costs.monthlyFixedCosts / costs.monthlyDeliveries;
    }
  }
}

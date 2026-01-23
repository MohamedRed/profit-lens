import '../../profitability/domain/cost_breakdown.dart';
import '../../profitability/domain/cost_settings.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'offer.dart';
import 'offer_extraction_metadata.dart';
import 'offer_source.dart';

class OfferRecord {
  final String id;
  final Offer offer;
  final OfferSource source;
  final DateTime createdAt;
  final VehicleProfile vehicleSnapshot;
  final CostSettings costSnapshot;
  final CostBreakdown breakdown;
  final OfferExtractionMetadata? extraction;

  const OfferRecord({
    required this.id,
    required this.offer,
    required this.source,
    required this.createdAt,
    required this.vehicleSnapshot,
    required this.costSnapshot,
    required this.breakdown,
    required this.extraction,
  });
}

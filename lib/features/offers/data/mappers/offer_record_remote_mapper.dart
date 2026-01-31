import '../../../../core/extensions/iterable_extensions.dart';
import '../../domain/offer.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/offer_record.dart';
import '../../domain/offer_source.dart';
import 'cost_breakdown_mapper.dart';
import 'cost_settings_mapper.dart';
import 'route_verification_mapper.dart';
import 'vehicle_snapshot_mapper.dart';

class OfferRecordRemoteMapper {
  final CostSettingsMapper _costSettingsMapper;
  final CostBreakdownMapper _costBreakdownMapper;
  final VehicleSnapshotMapper _vehicleSnapshotMapper;
  final RouteVerificationMapper _routeVerificationMapper;

  OfferRecordRemoteMapper({
    CostSettingsMapper? costSettingsMapper,
    CostBreakdownMapper? costBreakdownMapper,
    VehicleSnapshotMapper? vehicleSnapshotMapper,
    RouteVerificationMapper? routeVerificationMapper,
  })  : _costSettingsMapper = costSettingsMapper ?? CostSettingsMapper(),
        _costBreakdownMapper = costBreakdownMapper ?? CostBreakdownMapper(),
        _vehicleSnapshotMapper = vehicleSnapshotMapper ?? VehicleSnapshotMapper(),
        _routeVerificationMapper =
            routeVerificationMapper ?? RouteVerificationMapper();

  OfferRecord? fromResponse(Map<String, dynamic>? data) {
    if (data == null) return null;
    final record = data['record'] is Map<String, dynamic>
        ? Map<String, dynamic>.from(data['record'] as Map)
        : data;
    final id = record['id'] as String?;
    final offer = _offerFromRecord(record);
    final source = _sourceFromString(record['source'] as String?);
    final createdAt = _parseDate(record['createdAt']);
    final vehicle = _vehicleSnapshotMapper
        .fromDocument(record['vehicleSnapshot'] as Map<String, dynamic>?);
    final costSettings = _costSettingsMapper
        .fromDocument(record['costSnapshot'] as Map<String, dynamic>?);
    final breakdown = _costBreakdownMapper
        .fromDocument(record['breakdown'] as Map<String, dynamic>?);

    if (id == null ||
        offer == null ||
        source == null ||
        createdAt == null ||
        vehicle == null ||
        costSettings == null ||
        breakdown == null) {
      return null;
    }

    return OfferRecord(
      id: id,
      offer: offer,
      source: source,
      createdAt: createdAt,
      vehicleSnapshot: vehicle,
      costSnapshot: costSettings,
      breakdown: breakdown,
      extraction:
          _extractionFromDocument(record['extraction'] as Map<String, dynamic>?),
    );
  }

  Offer? _offerFromRecord(Map<String, dynamic> data) {
    final offerMap = data['offer'] is Map
        ? Map<String, dynamic>.from(data['offer'] as Map)
        : data;
    final payout = (offerMap['payoutEuro'] as num?)?.toDouble();
    final distance = (offerMap['distanceKm'] as num?)?.toDouble();
    if (payout == null || distance == null) return null;
    final routeVerificationMap = offerMap['routeVerification'] ??
        data['routeVerification'];
    return Offer(
      payoutEuro: payout,
      distanceKm: distance,
      durationMinutes: (offerMap['durationMinutes'] as num?)?.toDouble(),
      pickupName: offerMap['pickupName'] as String?,
      pickupAddress: offerMap['pickupAddress'] as String?,
      dropoffName: offerMap['dropoffName'] as String?,
      dropoffAddress: offerMap['dropoffAddress'] as String?,
      routeVerification: _routeVerificationMapper
          .fromDocument(routeVerificationMap as Map<String, dynamic>?),
    );
  }

  OfferSource? _sourceFromString(String? value) {
    if (value == null) return null;
    return OfferSource.values
        .where((element) => element.name == value)
        .firstOrNull;
  }

  DateTime? _parseDate(dynamic value) {
    if (value is String) {
      return DateTime.tryParse(value);
    }
    return null;
  }

  OfferExtractionMetadata? _extractionFromDocument(
      Map<String, dynamic>? data) {
    if (data == null) return null;
    final confidence = (data['confidence'] as num?)?.toDouble();
    if (confidence == null) return null;
    return OfferExtractionMetadata(
      confidence: confidence,
      rawText: data['rawText'] as String?,
    );
  }
}

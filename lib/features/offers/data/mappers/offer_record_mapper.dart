import 'package:cloud_firestore/cloud_firestore.dart';
import '../../../../core/extensions/iterable_extensions.dart';
import '../../domain/offer.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/offer_record.dart';
import '../../domain/offer_source.dart';
import 'cost_breakdown_mapper.dart';
import 'cost_settings_mapper.dart';
import 'route_verification_mapper.dart';
import 'vehicle_snapshot_mapper.dart';

class OfferRecordMapper {
  final CostSettingsMapper _costSettingsMapper;
  final CostBreakdownMapper _costBreakdownMapper;
  final VehicleSnapshotMapper _vehicleSnapshotMapper;
  final RouteVerificationMapper _routeVerificationMapper;

  OfferRecordMapper({
    CostSettingsMapper? costSettingsMapper,
    CostBreakdownMapper? costBreakdownMapper,
    VehicleSnapshotMapper? vehicleSnapshotMapper,
    RouteVerificationMapper? routeVerificationMapper,
  })  : _costSettingsMapper = costSettingsMapper ?? CostSettingsMapper(),
        _costBreakdownMapper = costBreakdownMapper ?? CostBreakdownMapper(),
        _vehicleSnapshotMapper = vehicleSnapshotMapper ?? VehicleSnapshotMapper(),
        _routeVerificationMapper =
            routeVerificationMapper ?? RouteVerificationMapper();

  OfferRecord? fromDocument(String id, Map<String, dynamic>? data) {
    if (data == null) return null;
    final offer = _offerFromDocument(data);
    final source = _sourceFromString(data['source'] as String?);
    final createdAt = (data['createdAt'] as Timestamp?)?.toDate();
    final vehicle = _vehicleSnapshotMapper
        .fromDocument(data['vehicleSnapshot'] as Map<String, dynamic>?);
    final costSettings = _costSettingsMapper
        .fromDocument(data['costSnapshot'] as Map<String, dynamic>?);
    final breakdown = _costBreakdownMapper
        .fromDocument(data['breakdown'] as Map<String, dynamic>?);
    if (offer == null || source == null || createdAt == null || vehicle == null || costSettings == null || breakdown == null) return null;
    return OfferRecord(
      id: id,
      offer: offer,
      source: source,
      createdAt: createdAt,
      vehicleSnapshot: vehicle,
      costSnapshot: costSettings,
      breakdown: breakdown,
      extraction:
          _extractionFromDocument(data['extraction'] as Map<String, dynamic>?),
    );
  }

  Map<String, dynamic> toDocument(OfferRecord record) {
    return {
      'payoutEuro': record.offer.payoutEuro,
      'distanceKm': record.offer.distanceKm,
      'durationMinutes': record.offer.durationMinutes,
      'pickupName': record.offer.pickupName,
      'pickupAddress': record.offer.pickupAddress,
      'dropoffName': record.offer.dropoffName,
      'dropoffAddress': record.offer.dropoffAddress,
      if (record.offer.routeVerification != null)
        'routeVerification':
            _routeVerificationMapper.toDocument(record.offer.routeVerification!),
      'source': record.source.name,
      'createdAt': Timestamp.fromDate(record.createdAt),
      'vehicleSnapshot': _vehicleSnapshotMapper.toDocument(record.vehicleSnapshot),
      'costSnapshot': _costSettingsMapper.toDocument(record.costSnapshot),
      'breakdown': _costBreakdownMapper.toDocument(record.breakdown),
      if (record.extraction != null)
        'extraction': {
          'confidence': record.extraction!.confidence,
          'rawText': record.extraction!.rawText,
        },
    };
  }

  Offer? _offerFromDocument(Map<String, dynamic> data) {
    final payout = (data['payoutEuro'] as num?)?.toDouble();
    final distance = (data['distanceKm'] as num?)?.toDouble();
    if (payout == null || distance == null) return null;
    return Offer(
      payoutEuro: payout,
      distanceKm: distance,
      durationMinutes: (data['durationMinutes'] as num?)?.toDouble(),
      pickupName: data['pickupName'] as String?,
      pickupAddress: data['pickupAddress'] as String?,
      dropoffName: data['dropoffName'] as String?,
      dropoffAddress: data['dropoffAddress'] as String?,
      routeVerification: _routeVerificationMapper
          .fromDocument(data['routeVerification'] as Map<String, dynamic>?),
    );
  }

  OfferSource? _sourceFromString(String? value) {
    if (value == null) return null;
    return OfferSource.values
        .where((element) => element.name == value)
        .firstOrNull;
  }

  OfferExtractionMetadata? _extractionFromDocument(Map<String, dynamic>? data) {
    if (data == null) return null;
    final confidence = (data['confidence'] as num?)?.toDouble();
    if (confidence == null) return null;
    return OfferExtractionMetadata(
      confidence: confidence,
      rawText: data['rawText'] as String?,
    );
  }
}

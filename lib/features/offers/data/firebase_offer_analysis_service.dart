import 'package:cloud_functions/cloud_functions.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import '../domain/offer.dart';
import '../domain/offer_extraction_metadata.dart';
import '../domain/offer_record.dart';
import '../domain/offer_source.dart';
import '../domain/route_verification.dart';
import 'mappers/offer_record_remote_mapper.dart';
import 'offer_analysis_service.dart';

class FirebaseOfferAnalysisService implements OfferAnalysisService {
  final FirebaseFunctions? _functions;
  final OfferRecordRemoteMapper _mapper;

  FirebaseOfferAnalysisService({
    FirebaseFunctions? functions,
    OfferRecordRemoteMapper? mapper,
  })  : _functions = functions,
        _mapper = mapper ?? OfferRecordRemoteMapper();

  @override
  Future<OfferRecord> analyzeOffer({
    required Offer offer,
    required RouteVerification? routeVerification,
    required String? vehicleId,
    required OfferSource source,
    OfferExtractionMetadata? extraction,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    final callable = (_functions ??
            FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion))
        .httpsCallable('analyzeOffer');
    final response = await callable.call(<String, dynamic>{
      'offer': _encodeOffer(offer),
      if (routeVerification != null)
        'routeVerification': _encodeRouteVerification(routeVerification),
      if (vehicleId != null) 'vehicleId': vehicleId,
      'source': source.name,
      if (extraction != null)
        'extraction': {
          'confidence': extraction.confidence,
          'rawText': extraction.rawText,
        },
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final record = _mapper.fromResponse(data);
    if (record == null) {
      throw StateError('Missing analysis result.');
    }
    return record;
  }

  Map<String, dynamic> _encodeOffer(Offer offer) {
    return {
      'payoutEuro': offer.payoutEuro,
      'distanceKm': offer.distanceKm,
      'durationMinutes': offer.durationMinutes,
      'pickupName': offer.pickupName,
      'pickupAddress': offer.pickupAddress,
      'dropoffName': offer.dropoffName,
      'dropoffAddress': offer.dropoffAddress,
    };
  }

  Map<String, dynamic> _encodeRouteVerification(RouteVerification verification) {
    return {
      'distanceKm': verification.distanceKm,
      'durationMinutes': verification.durationMinutes,
      'provider': verification.provider,
      'travelMode': verification.travelMode,
      'verifiedAt': verification.verifiedAt.toIso8601String(),
    };
  }
}

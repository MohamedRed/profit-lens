import 'dart:convert';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import '../domain/offer_input.dart';
import '../domain/offer_record.dart';
import '../domain/offer_source.dart';
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
    OfferInput? offer,
    XFile? image,
    String? vehicleId,
    OfferSource? source,
  }) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    final callable = (_functions ??
            FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion))
        .httpsCallable('analyzeOffer');
    final payload = <String, dynamic>{
      if (offer != null) 'offer': _encodeOffer(offer),
      if (vehicleId != null) 'vehicleId': vehicleId,
      if (source != null) 'source': source.name,
    };
    if (image != null) {
      final mimeType = image.mimeType;
      if (mimeType == null || mimeType.isEmpty) {
        throw StateError('Missing image mime type.');
      }
      final bytes = await image.readAsBytes();
      payload['imageBase64'] = base64Encode(bytes);
      payload['mimeType'] = mimeType;
    }
    final response = await callable.call(<String, dynamic>{
      ...payload,
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final record = _mapper.fromResponse(data);
    if (record == null) {
      throw StateError('Missing analysis result.');
    }
    return record;
  }

  Map<String, dynamic> _encodeOffer(OfferInput offer) {
    return {
      'payoutEuro': offer.payoutEuro,
      if (offer.distanceKm != null) 'distanceKm': offer.distanceKm,
      if (offer.durationMinutes != null)
        'durationMinutes': offer.durationMinutes,
      if (offer.pickupName != null) 'pickupName': offer.pickupName,
      if (offer.pickupAddress != null) 'pickupAddress': offer.pickupAddress,
      if (offer.dropoffName != null) 'dropoffName': offer.dropoffName,
      if (offer.dropoffAddress != null)
        'dropoffAddress': offer.dropoffAddress,
    };
  }
}

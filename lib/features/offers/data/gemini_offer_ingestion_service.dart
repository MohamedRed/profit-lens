import 'dart:convert';

import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

import '../../../core/config/app_config.dart';
import '../../../core/config/firebase_regions.dart';
import '../domain/offer.dart';
import '../domain/offer_extraction_result.dart';
import 'offer_ingestion_service.dart';

class GeminiOfferIngestionService implements OfferIngestionService {
  final FirebaseFunctions? _functions;

  GeminiOfferIngestionService({FirebaseFunctions? functions})
      : _functions = functions;

  @override
  Future<OfferExtractionResult> extractFromImage(XFile image) async {
    if (!AppConfig.firebaseConfigured) {
      throw StateError('Firebase is not configured.');
    }
    final mimeType = image.mimeType;
    if (mimeType == null || mimeType.isEmpty) {
      throw StateError('Missing image mime type.');
    }

    final bytes = await image.readAsBytes();
    final base64Image = base64Encode(bytes);
    final callable = (_functions ??
            FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion))
        .httpsCallable(
      'extractOfferFromImage',
    );
    final response = await callable.call(<String, dynamic>{
      'imageBase64': base64Image,
      'mimeType': mimeType,
      'debug': kDebugMode,
    });

    final data = Map<String, dynamic>.from(response.data as Map);
    if (kDebugMode) {
      final debug = data['debug'] as Map?;
      final raw = debug?['geminiText'] as String?;
      if (raw != null && raw.isNotEmpty) {
        debugPrint('Gemini raw response: $raw');
      }
    }
    final offerData = data['offer'] as Map<String, dynamic>?;
    final confidence = (data['confidence'] as num?)?.toDouble() ?? 0;
    final rawText = data['rawText'] as String?;

    Offer? offer;
    if (offerData != null) {
      final payout = (offerData['payoutEuro'] as num?)?.toDouble();
      final distance = (offerData['distanceKm'] as num?)?.toDouble();
      if (payout != null && distance != null) {
        offer = Offer(
          payoutEuro: payout,
          distanceKm: distance,
          pickupName: offerData['pickupName'] as String?,
          pickupAddress: offerData['pickupAddress'] as String?,
          dropoffName: offerData['dropoffName'] as String?,
          dropoffAddress: offerData['dropoffAddress'] as String?,
        );
      }
    }

    return OfferExtractionResult(
      offer: offer,
      confidence: confidence,
      rawText: rawText,
    );
  }
}

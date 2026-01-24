import 'package:flutter/material.dart';

import '../../../../core/utils/number_parsing.dart';
import '../../domain/offer.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/offer_extraction_result.dart';
import '../../domain/offer_source.dart';
import '../../domain/place_selection.dart';

class OfferFlowController {
  final TextEditingController payoutController = TextEditingController();
  final TextEditingController distanceController = TextEditingController();
  final TextEditingController durationController = TextEditingController();
  final TextEditingController pickupNameController = TextEditingController();
  final TextEditingController pickupAddressController = TextEditingController();

  OfferSource source = OfferSource.manual;
  OfferExtractionMetadata? extraction;
  PlaceSelection? pickupSelection;

  void dispose() {
    payoutController.dispose();
    distanceController.dispose();
    durationController.dispose();
    pickupNameController.dispose();
    pickupAddressController.dispose();
  }

  void applyExtraction(OfferExtractionResult result) {
    if (result.offer == null) {
      return;
    }
    payoutController.text = result.offer!.payoutEuro.toStringAsFixed(2);
    distanceController.text = result.offer!.distanceKm.toStringAsFixed(1);
    pickupNameController.text = result.offer!.pickupName ?? '';
    pickupAddressController.text = result.offer!.pickupAddress ?? '';
    source = OfferSource.screenshot;
    extraction = OfferExtractionMetadata(
      confidence: result.confidence,
      rawText: result.rawText,
    );
    pickupSelection = null;
  }

  void applyPickupSelection(PlaceSelection selection) {
    pickupSelection = selection;
    if (selection.formattedAddress != null &&
        selection.formattedAddress!.isNotEmpty) {
      pickupAddressController.text = selection.formattedAddress!;
    }
  }

  Offer? buildOffer() {
    final payout = NumberParsing.parseDouble(payoutController.text);
    final distance = NumberParsing.parseDouble(distanceController.text);
    final duration = NumberParsing.parseDouble(durationController.text);
    if (payout == null || distance == null) {
      return null;
    }
    return Offer(
      payoutEuro: payout,
      distanceKm: distance,
      durationMinutes: duration,
      pickupName: pickupNameController.text.trim().isEmpty
          ? null
          : pickupNameController.text.trim(),
      pickupAddress: pickupAddressController.text.trim().isEmpty
          ? null
          : pickupAddressController.text.trim(),
    );
  }
}

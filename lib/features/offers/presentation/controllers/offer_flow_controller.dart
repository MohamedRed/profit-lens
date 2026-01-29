import 'package:flutter/material.dart';

import '../../../../core/utils/number_parsing.dart';
import '../../domain/offer.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/offer_extraction_result.dart';
import '../../domain/offer_source.dart';
import '../../domain/place_selection.dart';
import '../../domain/route_verification.dart';

class OfferFlowController {
  final TextEditingController payoutController = TextEditingController();
  final TextEditingController distanceController = TextEditingController();
  final TextEditingController durationController = TextEditingController();
  final TextEditingController pickupNameController = TextEditingController();
  final TextEditingController pickupAddressController = TextEditingController();
  final TextEditingController dropoffNameController = TextEditingController();
  final TextEditingController dropoffAddressController = TextEditingController();

  OfferSource source = OfferSource.manual;
  OfferExtractionMetadata? extraction;
  PlaceSelection? pickupSelection;
  PlaceSelection? dropoffSelection;
  RouteVerification? routeVerification;

  void dispose() {
    payoutController.dispose();
    distanceController.dispose();
    durationController.dispose();
    pickupNameController.dispose();
    pickupAddressController.dispose();
    dropoffNameController.dispose();
    dropoffAddressController.dispose();
  }

  void applyExtraction(OfferExtractionResult result) {
    if (result.offer == null) {
      return;
    }
    payoutController.text = result.offer!.payoutEuro.toStringAsFixed(2);
    distanceController.text = result.offer!.distanceKm.toStringAsFixed(1);
    pickupNameController.text = result.offer!.pickupName ?? '';
    pickupAddressController.text = result.offer!.pickupAddress ?? '';
    dropoffNameController.text = result.offer!.dropoffName ?? '';
    dropoffAddressController.text = result.offer!.dropoffAddress ?? '';
    source = OfferSource.screenshot;
    extraction = OfferExtractionMetadata(
      confidence: result.confidence,
      rawText: result.rawText,
    );
    pickupSelection = null;
    dropoffSelection = null;
    routeVerification = null;
  }

  void applyPickupSelection(PlaceSelection selection) {
    pickupSelection = selection;
    routeVerification = null;
    if (selection.formattedAddress != null &&
        selection.formattedAddress!.isNotEmpty) {
      pickupAddressController.text = selection.formattedAddress!;
    }
    if (selection.name != null && selection.name!.isNotEmpty) {
      pickupNameController.text = selection.name!;
    }
  }

  void applyDropoffSelection(PlaceSelection selection) {
    dropoffSelection = selection;
    routeVerification = null;
    if (selection.formattedAddress != null &&
        selection.formattedAddress!.isNotEmpty) {
      dropoffAddressController.text = selection.formattedAddress!;
    }
    if (selection.name != null && selection.name!.isNotEmpty) {
      dropoffNameController.text = selection.name!;
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
      dropoffName: dropoffNameController.text.trim().isEmpty
          ? null
          : dropoffNameController.text.trim(),
      dropoffAddress: dropoffAddressController.text.trim().isEmpty
          ? null
          : dropoffAddressController.text.trim(),
      routeVerification: routeVerification,
    );
  }

  void applyRouteVerification(RouteVerification verification) {
    routeVerification = verification;
  }
}

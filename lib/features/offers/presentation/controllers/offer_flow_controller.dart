import 'dart:typed_data';

import 'package:flutter/material.dart';

import '../../../../core/utils/number_parsing.dart';
import '../../domain/offer_input.dart';
import '../../domain/offer_extraction_metadata.dart';
import '../../domain/offer_record.dart';
import '../../domain/offer_source.dart';
import '../../domain/place_selection.dart';
import '../../domain/route_verification.dart';
import '../offer_analysis_status.dart';

class OfferFlowController {
  int _analysisRunId = 0;

  final TextEditingController payoutController = TextEditingController();
  final TextEditingController distanceController = TextEditingController();
  final TextEditingController durationController = TextEditingController();
  final TextEditingController pickupNameController = TextEditingController();
  final TextEditingController pickupAddressController = TextEditingController();
  final TextEditingController dropoffNameController = TextEditingController();
  final TextEditingController dropoffAddressController =
      TextEditingController();

  OfferSource source = OfferSource.manual;
  OfferExtractionMetadata? extraction;
  PlaceSelection? pickupSelection;
  PlaceSelection? dropoffSelection;
  RouteVerification? routeVerification;
  OfferRecord? analysisRecord;
  Uint8List? screenshotThumbnail;
  OfferAnalysisStatus analysisStatus = OfferAnalysisStatus.idle;
  String? analysisErrorMessage;

  void dispose() {
    payoutController.dispose();
    distanceController.dispose();
    durationController.dispose();
    pickupNameController.dispose();
    pickupAddressController.dispose();
    dropoffNameController.dispose();
    dropoffAddressController.dispose();
  }

  void applyPickupSelection(PlaceSelection selection) {
    pickupSelection = selection;
    routeVerification = null;
    analysisRecord = null;
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
    analysisRecord = null;
    if (selection.formattedAddress != null &&
        selection.formattedAddress!.isNotEmpty) {
      dropoffAddressController.text = selection.formattedAddress!;
    }
    if (selection.name != null && selection.name!.isNotEmpty) {
      dropoffNameController.text = selection.name!;
    }
  }

  OfferInput? buildOffer() {
    final payout = NumberParsing.parseDouble(payoutController.text);
    if (payout == null) {
      return null;
    }
    final distance = NumberParsing.parseDouble(distanceController.text);
    final duration = NumberParsing.parseDouble(durationController.text);
    return OfferInput(
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
    );
  }

  void applyAnalysisResult(OfferRecord record) {
    analysisRecord = record;
    final offer = record.offer;
    payoutController.text = offer.payoutEuro.toStringAsFixed(2);
    distanceController.text = offer.distanceKm.toStringAsFixed(1);
    durationController.text = offer.durationMinutes == null
        ? ''
        : offer.durationMinutes!.toStringAsFixed(0);
    pickupNameController.text = offer.pickupName ?? '';
    pickupAddressController.text = offer.pickupAddress ?? '';
    dropoffNameController.text = offer.dropoffName ?? '';
    dropoffAddressController.text = offer.dropoffAddress ?? '';
    source = record.source;
    extraction = record.extraction;
    routeVerification = offer.routeVerification;
  }

  void resetOfferDetails() {
    payoutController.clear();
    distanceController.clear();
    durationController.clear();
    pickupNameController.clear();
    pickupAddressController.clear();
    dropoffNameController.clear();
    dropoffAddressController.clear();
    pickupSelection = null;
    dropoffSelection = null;
    extraction = null;
    source = OfferSource.manual;
    screenshotThumbnail = null;
    clearAnalysis();
  }

  void setScreenshotThumbnail(Uint8List bytes) {
    screenshotThumbnail = bytes;
  }

  void clearScreenshotThumbnail() {
    screenshotThumbnail = null;
  }

  int startAnalysis(OfferAnalysisStatus status) {
    clearAnalysis();
    analysisStatus = status;
    analysisErrorMessage = null;
    return _analysisRunId;
  }

  bool isCurrentAnalysis(int runId) => runId == _analysisRunId;

  void setAnalysisStatus(OfferAnalysisStatus status, {String? errorMessage}) {
    analysisStatus = status;
    analysisErrorMessage = errorMessage;
  }

  void clearAnalysis() {
    _analysisRunId += 1;
    analysisStatus = OfferAnalysisStatus.idle;
    analysisErrorMessage = null;
    analysisRecord = null;
    routeVerification = null;
  }

  void resetAnalysisIfNeeded() {
    if (analysisStatus == OfferAnalysisStatus.completed ||
        analysisStatus == OfferAnalysisStatus.failed) {
      clearAnalysis();
    }
  }
}

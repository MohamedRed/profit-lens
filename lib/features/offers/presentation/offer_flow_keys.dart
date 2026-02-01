import 'package:flutter/widgets.dart';

class OfferFlowKeys {
  const OfferFlowKeys._();

  static const payoutField = ValueKey('offer_payout');
  static const pickupNameField = ValueKey('offer_pickup_name');
  static const pickupAddressField = ValueKey('offer_pickup_address');
  static const dropoffNameField = ValueKey('offer_dropoff_name');
  static const dropoffAddressField = ValueKey('offer_dropoff_address');
  static const importScreenshotButton = ValueKey('offer_import_screenshot');
  static const captureScreenshotButton = ValueKey('offer_capture_screenshot');
  static const viewDetailsButton = ValueKey('offer_view_details');
}

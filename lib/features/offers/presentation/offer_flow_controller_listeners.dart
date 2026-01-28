import 'package:flutter/widgets.dart';

import 'controllers/offer_flow_controller.dart';

void bindOfferFlowControllerListeners({
  required OfferFlowController controller,
  required VoidCallback onChanged,
}) {
  for (final textController in [
    controller.payoutController,
    controller.distanceController,
    controller.durationController,
    controller.pickupNameController,
    controller.pickupAddressController,
    controller.dropoffNameController,
    controller.dropoffAddressController,
  ]) {
    textController.addListener(onChanged);
  }
}

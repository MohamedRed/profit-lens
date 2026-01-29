import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../domain/place_selection.dart';
import '../domain/route_verification.dart';
import 'controllers/offer_flow_controller.dart';

Future<RouteVerification?> verifyOfferRoute({
  required BuildContext context,
  required OfferFlowController controller,
  required VehicleProfile vehicle,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final pickup = controller.pickupSelection;
  final dropoff = controller.dropoffSelection;
  if (!_hasLocation(pickup) || !_hasLocation(dropoff)) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.routeVerificationMissingMessage)),
    );
    return null;
  }
  try {
    return await AppScope.of(context).routeVerificationService.verifyRoute(
      origin: pickup!,
      destination: dropoff!,
      vehicleType: vehicle.type,
    );
  } catch (_) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.routeVerificationFailedMessage)),
    );
    return null;
  }
}

bool _hasLocation(PlaceSelection? selection) {
  if (selection == null) {
    return false;
  }
  final placeId = selection.placeId?.trim();
  if (placeId != null && placeId.isNotEmpty) {
    return true;
  }
  return selection.latitude != null && selection.longitude != null;
}

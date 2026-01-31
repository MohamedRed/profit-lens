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
  final pickup = _buildSelection(
    selection: controller.pickupSelection,
    addressText: controller.pickupAddressController.text,
    nameText: controller.pickupNameController.text,
  );
  final dropoff = _buildSelection(
    selection: controller.dropoffSelection,
    addressText: controller.dropoffAddressController.text,
    nameText: controller.dropoffNameController.text,
  );
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
  final placeId = selection.placeId.trim();
  if (placeId.isNotEmpty) {
    return true;
  }
  if (selection.latitude != null && selection.longitude != null) {
    return true;
  }
  final address = _readString(selection.formattedAddress) ??
      _readString(selection.displayValue) ??
      _readString(selection.name);
  return address != null;
}

PlaceSelection? _buildSelection({
  required PlaceSelection? selection,
  required String addressText,
  required String nameText,
}) {
  if (selection != null) {
    return selection;
  }
  final address = addressText.trim();
  final name = nameText.trim();
  if (address.isEmpty && name.isEmpty) {
    return null;
  }
  final displayValue = address.isNotEmpty ? address : name;
  return PlaceSelection(
    placeId: '',
    formattedAddress: address.isNotEmpty ? address : null,
    name: name.isNotEmpty ? name : null,
    displayValue: displayValue.isNotEmpty ? displayValue : null,
  );
}

String? _readString(String? value) {
  final trimmed = value?.trim();
  if (trimmed == null || trimmed.isEmpty) {
    return null;
  }
  return trimmed;
}

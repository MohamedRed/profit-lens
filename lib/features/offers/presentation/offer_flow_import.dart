import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/app_scope.dart';
import '../data/offer_image_picker_service.dart';
import '../../../l10n/app_localizations.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_route_verification.dart';

Future<void> importOfferScreenshot({
  required BuildContext context,
  required ImageSource source,
  required OfferImagePickerService picker,
  required OfferFlowController controller,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
  required ValueChanged<bool> onLoadingChanged,
  required VoidCallback onUpdated,
}) async {
  final image = await picker.pickImage(source: source);
  if (image == null) {
    return;
  }
  if (!context.mounted) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
  onLoadingChanged(true);
  try {
    final result = await AppScope.of(context)
        .offerIngestionService
        .extractFromImage(image);
    if (!context.mounted) {
      return;
    }
    controller.applyExtraction(result);
    onUpdated();
    if (vehicles.isNotEmpty) {
      final vehicle = vehicles.firstWhere(
        (item) => item.id == selectedVehicleId,
        orElse: () => vehicles.first,
      );
      final verification = await verifyOfferRoute(
        context: context,
        controller: controller,
        vehicle: vehicle,
      );
      if (verification != null) {
        controller.applyRouteVerification(verification);
        onUpdated();
      }
    }
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.extractionFailedMessage)),
    );
  } finally {
    if (context.mounted) {
      onLoadingChanged(false);
    }
  }
}

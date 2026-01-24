import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../presentation/offer_result_screen.dart';
import 'controllers/offer_flow_controller.dart';
import 'offer_flow_analysis.dart';
import 'offer_flow_guard.dart';

Future<void> handleOfferAnalysis({
  required BuildContext context,
  required GlobalKey<FormState> formKey,
  required OfferFlowController controller,
  required UserProfile profile,
  required AuthUser user,
  required List<VehicleProfile> vehicles,
  required String? selectedVehicleId,
}) async {
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }
  final vehicle = vehicles.firstWhere(
    (item) => item.id == selectedVehicleId,
    orElse: () => vehicles.first,
  );
  final ready = await ensureOfferReady(
    context: context,
    user: user,
    profile: profile,
    vehicle: vehicle,
  );
  if (!context.mounted) {
    return;
  }
  if (!ready) {
    return;
  }
  final record = analyzeOffer(
    context: context,
    controller: controller,
    profile: profile,
    vehicle: vehicle,
  );
  if (record == null) {
    return;
  }
  try {
    await AppScope.of(context).offerRepository.saveOffer(user.uid, record);
  } catch (_) {
    if (context.mounted) {
      final l10n = AppLocalizations.of(context)!;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.offerSaveFailedMessage)),
      );
    }
  }
  if (!context.mounted) {
    return;
  }
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => OfferResultScreen(
        user: user,
        record: record,
      ),
    ),
  );
}

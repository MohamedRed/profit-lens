import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../../vehicles/presentation/controllers/vehicle_form_controller.dart';
import '../../vehicles/presentation/vehicle_form_helpers.dart';
import 'controllers/business_profile_controller.dart';
import 'profile_form_values.dart';
import 'profile_form_validation.dart';

Future<void> saveProfileSetup({
  required BuildContext context,
  required AuthUser user,
  required GlobalKey<FormState> formKey,
  required BusinessProfileController businessController,
  required VehicleFormController vehicleController,
  required ValueChanged<bool> onSavingChanged,
}) async {
  final l10n = AppLocalizations.of(context)!;
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }

  final values = parseBusinessProfileValues(businessController);
  if (values == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.requiredFieldError)),
    );
    return;
  }

  final fixedCostError = validateFixedCosts(
    allocation: businessController.allocation,
    values: values,
    l10n: l10n,
  );
  if (fixedCostError != null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(fixedCostError)),
    );
    return;
  }

  late final VehicleProfile vehicle;
  try {
    final vehicleId = buildVehicleId(user: user, existing: null);
    vehicle = buildVehicleProfile(id: vehicleId, controller: vehicleController);
  } catch (_) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.requiredFieldError)),
    );
    return;
  }

  final profile = UserProfile(
    uid: user.uid,
    email: user.email,
    countryCode: 'FR',
    currencyCode: 'EUR',
    activity: businessController.activity,
    socialContributionRate: values.socialRate / 100,
    incomeTaxRate: values.incomeTax == null ? null : values.incomeTax! / 100,
    fixedCostAllocation: businessController.allocation,
    monthlyFixedCosts: values.monthlyFixedCosts,
    monthlyWorkingHours: values.monthlyHours,
    monthlyDistanceKm: values.monthlyDistance,
    monthlyDeliveries: values.monthlyDeliveries,
    defaultVehicleId: vehicle.id,
    useFranceDefaults: businessController.useFranceDefaults,
  );

  onSavingChanged(true);
  try {
    final services = AppScope.of(context);
    await services.userProfileRepository.saveProfile(profile);
    await services.vehicleRepository.saveVehicle(user.uid, vehicle);
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.profileSaveFailedMessage)),
    );
  } finally {
    if (context.mounted) {
      onSavingChanged(false);
    }
  }
}

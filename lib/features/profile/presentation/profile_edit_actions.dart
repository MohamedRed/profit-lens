import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import 'controllers/business_profile_controller.dart';
import 'profile_form_values.dart';
import 'profile_form_validation.dart';

Future<void> saveProfileEdit({
  required BuildContext context,
  required AuthUser user,
  required UserProfile existing,
  required GlobalKey<FormState> formKey,
  required BusinessProfileController controller,
  required ValueChanged<bool> onSavingChanged,
}) async {
  final l10n = AppLocalizations.of(context)!;
  if (!(formKey.currentState?.validate() ?? false)) {
    return;
  }
  final values = parseBusinessProfileValues(controller);
  if (values == null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.requiredFieldError)),
    );
    return;
  }
  final fixedCostError = validateFixedCosts(
    allocation: controller.allocation,
    values: values,
    l10n: l10n,
  );
  if (fixedCostError != null) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(fixedCostError)),
    );
    return;
  }

  final updated = existing.copyWith(
    activity: controller.activity,
    socialContributionRate: values.socialRate / 100,
    incomeTaxRate: values.incomeTax == null ? null : values.incomeTax! / 100,
    useLiberatoryTax: controller.useLiberatoryTax,
    fixedCostAllocation: controller.allocation,
    monthlyFixedCosts: values.monthlyFixedCosts,
    monthlyWorkingHours: values.monthlyHours,
    monthlyDistanceKm: values.monthlyDistance,
    monthlyDeliveries: values.monthlyDeliveries,
    useFranceDefaults: controller.useFranceDefaults,
  );

  onSavingChanged(true);
  try {
    await AppScope.of(context).userProfileRepository.saveProfile(updated);
    if (context.mounted) {
      Navigator.of(context).pop();
    }
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

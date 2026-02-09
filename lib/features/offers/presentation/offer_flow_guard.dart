import 'package:flutter/material.dart';

import '../../../l10n/app_localizations.dart';
import '../../auth/domain/auth_user.dart';
import '../../profile/domain/user_profile.dart';
import '../../profile/presentation/profile_edit_screen.dart';
import '../../vehicles/domain/vehicle_profile.dart';
import '../../vehicles/presentation/vehicle_form_screen.dart';
import 'missing_data/missing_data_builder.dart';
import 'missing_data/missing_data_dialog.dart';

Future<bool> ensureOfferReady({
  required BuildContext context,
  required AuthUser user,
  required UserProfile profile,
  required VehicleProfile vehicle,
}) async {
  final l10n = AppLocalizations.of(context)!;
  final sections = buildMissingDataSections(
    l10n: l10n,
    profile: profile,
    vehicle: vehicle,
  );
  if (sections.isEmpty) {
    return true;
  }
  final action = await showMissingDataDialog(
    context: context,
    l10n: l10n,
    sections: sections,
  );
  if (!context.mounted) {
    return false;
  }
  if (action == MissingDataAction.editProfile) {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => ProfileEditScreen(user: user, profile: profile),
      ),
    );
  } else if (action == MissingDataAction.editVehicle) {
    await Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) =>
            VehicleFormScreen(user: user, profile: profile, vehicle: vehicle),
      ),
    );
  }
  return false;
}

import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import 'missing_data_section.dart';

enum MissingDataAction { editProfile, editVehicle }

Future<MissingDataAction?> showMissingDataDialog({
  required BuildContext context,
  required AppLocalizations l10n,
  required List<MissingDataSection> sections,
}) {
  final hasProfile = sections.any((section) =>
      section.title == l10n.profileSectionTitle && section.items.isNotEmpty);
  final hasVehicle = sections.any((section) =>
      section.title == l10n.vehiclesSectionTitle && section.items.isNotEmpty);
  return showDialog<MissingDataAction>(
    context: context,
    builder: (context) => AlertDialog(
      title: Text(l10n.missingDataTitle),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.missingDataDescription),
          const SizedBox(height: 8),
          for (final section in sections) ...[
            Text(section.title, style: const TextStyle(fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            for (final item in section.items) Text('• $item'),
            const SizedBox(height: 8),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(l10n.okButton),
        ),
        if (hasProfile)
          TextButton(
            onPressed: () =>
                Navigator.of(context).pop(MissingDataAction.editProfile),
            child: Text(l10n.editProfileButton),
          ),
        if (hasVehicle)
          TextButton(
            onPressed: () =>
                Navigator.of(context).pop(MissingDataAction.editVehicle),
            child: Text(l10n.editVehicleButton),
          ),
      ],
    ),
  );
}

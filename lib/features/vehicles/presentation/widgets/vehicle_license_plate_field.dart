import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/license_plate.dart';

class VehicleLicensePlateField extends StatelessWidget {
  final TextEditingController controller;
  final bool isLookupInProgress;
  final VoidCallback? onLookup;

  const VehicleLicensePlateField({
    super.key,
    required this.controller,
    required this.isLookupInProgress,
    required this.onLookup,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 360;
        final field = TextFormField(
          controller: controller,
          autocorrect: false,
          enableSuggestions: false,
          textCapitalization: TextCapitalization.characters,
          decoration: InputDecoration(
            labelText: l10n.vehicleLicensePlateLabel,
            hintText: l10n.vehicleLicensePlateHint,
          ),
          validator: (value) {
            final trimmed = value?.trim() ?? '';
            if (trimmed.isEmpty) {
              return null;
            }
            if (!isValidFrenchLicensePlate(trimmed)) {
              return l10n.vehicleLicensePlateInvalid;
            }
            return null;
          },
        );
        final buttonChild = isLookupInProgress
            ? const SizedBox(
                height: 16,
                width: 16,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : Text(l10n.plateLookupButtonLabel);
        final button = SizedBox(
          height: 48,
          child: FilledButton(
            onPressed: isLookupInProgress ? null : onLookup,
            child: buttonChild,
          ),
        );
        if (isNarrow) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [field, const SizedBox(height: 8), button],
          );
        }
        return Row(
          children: [
            Expanded(child: field),
            const SizedBox(width: 12),
            SizedBox(width: 140, child: button),
          ],
        );
      },
    );
  }
}

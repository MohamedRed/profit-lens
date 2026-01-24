import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';

class VehiclePresetToggle extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const VehiclePresetToggle({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SwitchListTile.adaptive(
      value: value,
      onChanged: onChanged,
      title: Text(l10n.useVehiclePresetsLabel),
      contentPadding: EdgeInsets.zero,
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../defaults/data/vehicle_catalog_fr.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_autocomplete_field.dart';

class VehicleBrandAutocompleteField extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController controller;

  const VehicleBrandAutocompleteField({
    super.key,
    required this.vehicleType,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return VehicleAutocompleteField(
      controller: controller,
      label: l10n.vehicleBrandLabel,
      optionsBuilder: (query) {
        final normalizedQuery = query.toLowerCase();
        return VehicleCatalogFr.brandsForType(vehicleType).where(
          (brand) => brand.toLowerCase().startsWith(normalizedQuery),
        );
      },
    );
  }
}

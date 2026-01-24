import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../defaults/data/vehicle_catalog_fr.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_autocomplete_field.dart';

class VehicleBrandAutocompleteField extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController controller;
  final VoidCallback? onFocusLost;
  final FormFieldValidator<String>? validator;

  const VehicleBrandAutocompleteField({
    super.key,
    required this.vehicleType,
    required this.controller,
    this.onFocusLost,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return VehicleAutocompleteField(
      controller: controller,
      label: l10n.vehicleBrandLabel,
      onFocusLost: onFocusLost,
      validator: validator,
      optionsBuilder: (query) {
        final normalizedQuery = query.toLowerCase();
        final brands = VehicleCatalogFr.brandsForType(vehicleType);
        if (normalizedQuery.isEmpty) return brands;
        return brands.where(
          (brand) => brand.toLowerCase().startsWith(normalizedQuery),
        );
      },
    );
  }
}

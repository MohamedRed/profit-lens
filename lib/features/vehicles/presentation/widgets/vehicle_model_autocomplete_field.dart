import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../../defaults/data/vehicle_catalog_fr.dart';
import '../../domain/vehicle_type.dart';
import 'vehicle_autocomplete_field.dart';

class VehicleModelAutocompleteField extends StatelessWidget {
  final VehicleType vehicleType;
  final TextEditingController brandController;
  final TextEditingController controller;
  final VoidCallback? onEditingComplete;

  const VehicleModelAutocompleteField({
    super.key,
    required this.vehicleType,
    required this.brandController,
    required this.controller,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return VehicleAutocompleteField(
      controller: controller,
      label: l10n.vehicleModelLabel,
      textInputAction: TextInputAction.done,
      onEditingComplete: onEditingComplete,
      optionsBuilder: (query) {
        final brand = brandController.text;
        if (brand.trim().isEmpty) return const Iterable<String>.empty();
        final normalizedQuery = query.toLowerCase();
        return VehicleCatalogFr.modelsFor(type: vehicleType, brand: brand).where(
          (model) => model.toLowerCase().startsWith(normalizedQuery),
        );
      },
    );
  }
}

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
  final VoidCallback? onFocusLost;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onSelected;

  const VehicleModelAutocompleteField({
    super.key,
    required this.vehicleType,
    required this.brandController,
    required this.controller,
    this.onEditingComplete,
    this.onFocusLost,
    this.validator,
    this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return VehicleAutocompleteField(
      controller: controller,
      label: l10n.vehicleModelLabel,
      textInputAction: TextInputAction.done,
      onEditingComplete: onEditingComplete,
      onFocusLost: onFocusLost,
      onSelected: onSelected,
      validator: validator,
      optionsBuilder: (query) {
        final brand = brandController.text;
        if (brand.trim().isEmpty) return const Iterable<String>.empty();
        final normalizedQuery = query.toLowerCase();
        final models =
            VehicleCatalogFr.modelsFor(type: vehicleType, brand: brand);
        if (normalizedQuery.isEmpty) return models;
        return models.where(
          (model) => model.toLowerCase().startsWith(normalizedQuery),
        );
      },
    );
  }
}

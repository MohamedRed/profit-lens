import 'package:flutter/material.dart';

import '../../domain/place_selection.dart';

typedef PlaceSelectionCallback = void Function(PlaceSelection selection);

class PlaceAutocompleteField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final PlaceSelectionCallback? onSelected;
  final ValueChanged<bool>? onDropdownOpenChanged;

  const PlaceAutocompleteField({
    super.key,
    required this.controller,
    required this.label,
    this.onSelected,
    this.onDropdownOpenChanged,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label),
    );
  }
}

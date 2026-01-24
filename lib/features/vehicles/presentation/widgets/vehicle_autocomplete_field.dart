import 'package:flutter/material.dart';

typedef VehicleOptionsBuilder = Iterable<String> Function(String query);

class VehicleAutocompleteField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final VehicleOptionsBuilder optionsBuilder;
  final TextInputAction? textInputAction;
  final VoidCallback? onEditingComplete;

  const VehicleAutocompleteField({
    super.key,
    required this.controller,
    required this.label,
    required this.optionsBuilder,
    this.textInputAction,
    this.onEditingComplete,
  });

  @override
  Widget build(BuildContext context) {
    return RawAutocomplete<String>(
      textEditingController: controller,
      optionsBuilder: (value) {
        final query = value.text.trim();
        if (query.isEmpty) return const Iterable<String>.empty();
        return optionsBuilder(query);
      },
      displayStringForOption: (option) => option,
      onSelected: (selection) => controller.text = selection,
      fieldViewBuilder: (context, textController, focusNode, onFieldSubmitted) {
        return TextFormField(
          controller: textController,
          focusNode: focusNode,
          decoration: InputDecoration(labelText: label),
          textInputAction: textInputAction,
          onEditingComplete: onEditingComplete ?? onFieldSubmitted,
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        final optionList = options.toList(growable: false);
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(8),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxHeight: 220, minWidth: 280),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 4),
                itemCount: optionList.length,
                separatorBuilder: (context, index) =>
                    const Divider(height: 1),
                itemBuilder: (context, index) {
                  final option = optionList[index];
                  return InkWell(
                    onTap: () => onSelected(option),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      child: Text(option),
                    ),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }
}

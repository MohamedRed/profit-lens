import 'package:flutter/material.dart';

typedef VehicleOptionsBuilder = Iterable<String> Function(String query);

class VehicleAutocompleteField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final VehicleOptionsBuilder optionsBuilder;
  final TextInputAction? textInputAction;
  final VoidCallback? onEditingComplete;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onSelected;
  final VoidCallback? onFocusLost;

  const VehicleAutocompleteField({
    super.key,
    required this.controller,
    required this.label,
    required this.optionsBuilder,
    this.textInputAction,
    this.onEditingComplete,
    this.validator,
    this.onSelected,
    this.onFocusLost,
  });

  @override
  State<VehicleAutocompleteField> createState() =>
      _VehicleAutocompleteFieldState();
}

class _VehicleAutocompleteFieldState extends State<VehicleAutocompleteField> {
  late final FocusNode _focusNode;
  bool _didPrimeOptions = false;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode()..addListener(_handleFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_handleFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  void _handleFocusChange() {
    if (_focusNode.hasFocus) {
      if (!_didPrimeOptions && widget.controller.selection.baseOffset < 0) {
        _didPrimeOptions = true;
        widget.controller.selection = TextSelection.collapsed(
          offset: widget.controller.text.length,
        );
      }
      return;
    }
    widget.onFocusLost?.call();
  }

  @override
  Widget build(BuildContext context) {
    return RawAutocomplete<String>(
      textEditingController: widget.controller,
      focusNode: _focusNode,
      optionsBuilder: (value) {
        final query = value.text.trim();
        return widget.optionsBuilder(query);
      },
      displayStringForOption: (option) => option,
      onSelected: (selection) {
        widget.controller.text = selection;
        widget.onSelected?.call(selection);
      },
      fieldViewBuilder: (context, textController, focusNode, onFieldSubmitted) {
        return TextFormField(
          controller: textController,
          focusNode: focusNode,
          decoration: InputDecoration(labelText: widget.label),
          textInputAction: widget.textInputAction,
          onEditingComplete: widget.onEditingComplete ?? onFieldSubmitted,
          validator: widget.validator,
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
                separatorBuilder: (context, index) => const Divider(height: 1),
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

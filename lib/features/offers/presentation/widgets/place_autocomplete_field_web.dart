// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
import 'dart:ui_web' as ui;
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import '../../../../core/config/google_maps_config.dart';
import '../../../../l10n/app_localizations.dart';
import '../../domain/place_selection.dart';
import 'place_autocomplete_web_controller.dart';

typedef PlaceSelectionCallback = void Function(PlaceSelection selection);

class PlaceAutocompleteField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String? placeholder;
  final PlaceSelectionCallback? onSelected;
  final ValueChanged<bool>? onDropdownOpenChanged;
  final String countryCode;
  const PlaceAutocompleteField({
    super.key,
    required this.controller,
    required this.label,
    this.placeholder,
    this.onSelected,
    this.onDropdownOpenChanged,
    this.countryCode = 'fr',
  });
  @override
  State<PlaceAutocompleteField> createState() => _PlaceAutocompleteFieldState();
}

class _PlaceAutocompleteFieldState extends State<PlaceAutocompleteField> {
  static int _instanceId = 0;
  static const double _inputHeight = 48;
  late final String _viewType;
  late final PlaceAutocompleteWebController _webController;
  final DivElement _container = DivElement();
  bool _loadFailed = false;
  String? _errorDetails;
  bool _isEditing = true;
  bool _isDropdownOpen = false;
  @override
  void initState() {
    super.initState();
    _viewType = 'places-autocomplete-${_instanceId++}';
    _container.style
      ..width = '100%'
      ..height = '${_inputHeight}px'
      ..display = 'block'
      ..overflow = 'visible'
      ..position = 'relative'
      ..zIndex = '1000';
    _webController = PlaceAutocompleteWebController(
      container: _container,
      countryCode: widget.countryCode,
      placeholder: widget.placeholder ?? widget.label,
      onSelected: _handleSelection,
      onInputValueChanged: _handleInputValueChanged,
      onDropdownOpenChanged: _handleDropdownOpenChanged,
      onDropdownHeightChanged: _handleDropdownHeight,
    );
    ui.platformViewRegistry.registerViewFactory(
      _viewType,
      (int viewId) => _container,
    );
    _isEditing = widget.controller.text.trim().isEmpty;
    _boot();
  }

  @override
  void dispose() {
    _webController.dispose();
    super.dispose();
  }

  Future<void> _boot() async {
    if (!hasGoogleMapsApiKey) {
      setState(() {
        _loadFailed = true;
        _errorDetails = 'Missing GOOGLE_MAPS_API_KEY.';
      });
      return;
    }
    try {
      await _webController.boot();
    } catch (error) {
      if (mounted) {
        setState(() {
          _loadFailed = true;
          _errorDetails = error.toString();
        });
      }
    }
  }

  void _handleSelection(PlaceSelection selection) {
    final displayValue =
        _displayValueFor(selection) ?? _webController.lastTypedValue;
    final nextValue = displayValue?.trim() ?? '';
    if (nextValue.isNotEmpty) {
      widget.controller.text = nextValue;
    }
    widget.onSelected?.call(selection);
    if (mounted && nextValue.isNotEmpty) {
      setState(() => _isEditing = false);
      return;
    }
    Future.delayed(const Duration(milliseconds: 50), () {
      if (!mounted) {
        return;
      }
      final retryValue =
          _webController.readCurrentValue() ?? _webController.lastTypedValue;
      final retryText = retryValue?.trim() ?? '';
      if (retryText.isNotEmpty) {
        widget.controller.text = retryText;
        setState(() => _isEditing = false);
      }
    });
  }

  void _handleInputValueChanged(String value) {
    final nextValue = value.trim();
    if (nextValue.isEmpty) {
      return;
    }
    if (widget.controller.text != nextValue) {
      widget.controller.text = nextValue;
    }
  }

  void _handleDropdownOpenChanged(bool isOpen) {
    if (_isDropdownOpen == isOpen) {
      return;
    }
    _isDropdownOpen = isOpen;
    widget.onDropdownOpenChanged?.call(isOpen);
  }

  void _handleDropdownHeight(double height) {}

  String? _displayValueFor(PlaceSelection selection) {
    final provided = selection.displayValue?.trim();
    if (provided != null && provided.isNotEmpty) {
      return provided;
    }
    final address = selection.formattedAddress?.trim();
    if (address != null && address.isNotEmpty) {
      return address;
    }
    final name = selection.name?.trim();
    if (name != null && name.isNotEmpty) {
      return name;
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final hasLabel = widget.label.trim().isNotEmpty;
    if (_loadFailed) {
      final errorStyle = TextStyle(color: Theme.of(context).colorScheme.error);
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(l10n.mapsAutocompleteUnavailableMessage, style: errorStyle),
          if (kDebugMode && _errorDetails != null) ...[
            const SizedBox(height: 4),
            Text('Debug: $_errorDetails', style: errorStyle),
            Text('Host: ${window.location.host}', style: errorStyle),
            Text(
              'Key present: ${hasGoogleMapsApiKey ? "yes" : "no"}',
              style: errorStyle,
            ),
          ],
        ],
      );
    }
    final hasValue = widget.controller.text.trim().isNotEmpty;
    if (!_isEditing && hasValue) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (hasLabel) ...[
            Text(widget.label, style: Theme.of(context).textTheme.bodyMedium),
            const SizedBox(height: 8),
          ],
          TextFormField(
            controller: widget.controller,
            readOnly: true,
            decoration: InputDecoration(
              suffixIcon: IconButton(
                icon: const Icon(Icons.edit),
                onPressed: () => setState(() => _isEditing = true),
              ),
            ),
            onTap: () => setState(() => _isEditing = true),
          ),
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (hasLabel) ...[
          Text(widget.label, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
        ],
        SizedBox(
          height: _inputHeight,
          child: HtmlElementView(viewType: _viewType),
        ),
        if (hasValue)
          Padding(
            padding: const EdgeInsets.only(top: 6),
            child: TextButton(
              onPressed: () => setState(() => _isEditing = false),
              child: Text(l10n.useSelectedPlaceButton),
            ),
          ),
      ],
    );
  }
}

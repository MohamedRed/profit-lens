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
  final PlaceSelectionCallback? onSelected;
  final String countryCode;
  const PlaceAutocompleteField({
    super.key,
    required this.controller,
    required this.label,
    this.onSelected,
    this.countryCode = 'fr',
  });
  @override
  State<PlaceAutocompleteField> createState() => _PlaceAutocompleteFieldState();
}

class _PlaceAutocompleteFieldState extends State<PlaceAutocompleteField> {
  static int _instanceId = 0;
  static const double _inputHeight = 48;
  static const double _listMaxHeight = 240;
  late final String _viewType;
  late final PlaceAutocompleteWebController _webController;
  final DivElement _container = DivElement();
  bool _loadFailed = false;
  String? _errorDetails;
  bool _isEditing = true;
  double _dropdownHeight = 0;
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
      onSelected: _handleSelection,
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
    }
  }

  void _handleDropdownHeight(double height) {
    final nextHeight = height < 0 ? 0 : height;
    final clampedHeight = (nextHeight > _listMaxHeight
            ? _listMaxHeight
            : nextHeight)
        .toDouble();
    if (clampedHeight == _dropdownHeight) {
      return;
    }
    if (mounted) {
      setState(() => _dropdownHeight = clampedHeight);
    }
  }

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
          Text(widget.label, style: Theme.of(context).textTheme.bodyMedium),
          const SizedBox(height: 8),
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
        Text(widget.label, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 8),
        SizedBox(
          height: _inputHeight,
          child: HtmlElementView(viewType: _viewType),
        ),
        if (_isEditing && _dropdownHeight > 0)
          SizedBox(height: _dropdownHeight),
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

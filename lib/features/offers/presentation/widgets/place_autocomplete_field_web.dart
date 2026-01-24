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
  late final String _viewType;
  late final PlaceAutocompleteWebController _webController;
  final DivElement _container = DivElement();
  bool _loadFailed = false;
  String? _errorDetails;
  @override
  void initState() {
    super.initState();
    _viewType = 'places-autocomplete-${_instanceId++}';
    _container.style.width = '100%';
    _webController = PlaceAutocompleteWebController(container: _container, countryCode: widget.countryCode, onSelected: _handleSelection);
    ui.platformViewRegistry.registerViewFactory(_viewType, (int viewId) => _container);
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
    } catch (_) {
      if (mounted) {
        setState(() {
          _loadFailed = true;
          _errorDetails = 'Failed to load Google Maps JS / Places UI Kit.';
        });
      }
    }
  }
  void _handleSelection(PlaceSelection selection) {
    if (selection.formattedAddress != null &&
        selection.formattedAddress!.isNotEmpty) {
      widget.controller.text = selection.formattedAddress!;
    }
    widget.onSelected?.call(selection);
    if (mounted) setState(() {});
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
            Text('Key present: ${hasGoogleMapsApiKey ? "yes" : "no"}',
                style: errorStyle),
          ],
        ],
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(widget.label, style: Theme.of(context).textTheme.bodyMedium),
        const SizedBox(height: 8),
        SizedBox(height: 48, child: HtmlElementView(viewType: _viewType)),
        ValueListenableBuilder<TextEditingValue>(
          valueListenable: widget.controller,
          builder: (context, value, _) {
            if (value.text.trim().isEmpty) {
              return const SizedBox.shrink();
            }
            return Padding(
              padding: const EdgeInsets.only(top: 6),
              child: Text(
                value.text,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            );
          },
        ),
      ],
    );
  }
}

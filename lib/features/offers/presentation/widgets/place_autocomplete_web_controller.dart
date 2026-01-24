// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;
import '../../../../core/config/google_maps_config.dart';
import '../../../../core/web/google_maps_loader_web.dart';
import '../../domain/place_selection.dart';
import 'place_autocomplete_web_style.dart';
class PlaceAutocompleteWebController {
  final DivElement container;
  final String countryCode;
  final void Function(PlaceSelection selection) onSelected;
  Element? _autocompleteElement;
  EventListener? _selectListener;
  String? _lastDisplayValue;
  PlaceAutocompleteWebController({
    required this.container,
    required this.countryCode,
    required this.onSelected,
  });
  Future<void> boot() async {
    if (!hasGoogleMapsApiKey) {
      throw StateError('Missing GOOGLE_MAPS_API_KEY.');
    }
    await GoogleMapsLoader.load(apiKey: googleMapsApiKey);
    final authFailure = GoogleMapsLoader.authFailureMessage;
    if (authFailure != null) {
      throw StateError(authFailure);
    }
    await _ensureUiKitReady();
    _mountAutocomplete();
  }
  void dispose() {
    if (_autocompleteElement != null && _selectListener != null) {
      _autocompleteElement!.removeEventListener('gmp-select', _selectListener);
    }
  }
  Future<void> _ensureUiKitReady() async {
    final customElements = js_util.getProperty(window, 'customElements');
    if (customElements == null) {
      throw StateError('Custom elements are unavailable in this browser.');
    }
    await js_util.promiseToFuture(
      js_util.callMethod(customElements, 'whenDefined', ['gmp-basic-place-autocomplete']),
    );
    await js_util.promiseToFuture(
      js_util.callMethod(customElements, 'whenDefined', ['gmp-place-details-compact']),
    );
  }

  void _mountAutocomplete() {
    final autocomplete =
        Element.tag('gmp-basic-place-autocomplete') as HtmlElement;
    final regionCodes = [countryCode.toLowerCase()];
    final options = js_util.jsify({
      'includedRegionCodes': regionCodes,
    });
    try {
      js_util.setProperty(autocomplete, 'includedRegionCodes', regionCodes);
    } catch (_) {}
    try {
      js_util.setProperty(autocomplete, 'options', options);
    } catch (_) {}
    stylePlacesAutocomplete(autocomplete);
    _selectListener = (event) {
      final place = js_util.getProperty(event, 'place');
      final placeId = js_util.getProperty(place, 'id') as String? ??
          js_util.getProperty(place, 'placeId') as String? ??
          '';
      final formattedAddress =
          js_util.getProperty(place, 'formattedAddress') as String?;
      final displayName = js_util.getProperty(place, 'displayName');
      String? name;
      if (displayName != null) {
        final displayText = js_util.getProperty(displayName, 'text');
        if (displayText is String && displayText.isNotEmpty) {
          name = displayText;
        }
      }
      name ??= js_util.getProperty(place, 'name') as String?;
      final location = js_util.getProperty(place, 'location');
      double? lat;
      double? lng;
      try {
        lat = (js_util.callMethod(location, 'lat', []) as num).toDouble();
        lng = (js_util.callMethod(location, 'lng', []) as num).toDouble();
      } catch (_) {
        lat = null;
        lng = null;
      }
      onSelected(
        PlaceSelection(
          placeId: placeId,
          name: name,
          formattedAddress: formattedAddress,
          latitude: lat,
          longitude: lng,
        ),
      );
      final displayValue = formattedAddress ?? name;
      if (displayValue != null && displayValue.isNotEmpty) {
        _setAutocompleteValue(autocomplete, displayValue);
      }
    };
    autocomplete.addEventListener('gmp-select', _selectListener);
    container.children
      ..clear()
      ..add(autocomplete)
      ;
    _autocompleteElement = autocomplete;
  }

  void _setAutocompleteValue(Element element, String value) {
    if (value == _lastDisplayValue) {
      return;
    }
    _lastDisplayValue = value;
    try {
      js_util.setProperty(element, 'value', value);
    } catch (_) {}
    try {
      js_util.setProperty(element, 'inputValue', value);
    } catch (_) {}
    try {
      js_util.setProperty(element, 'query', value);
    } catch (_) {}
    try {
      js_util.callMethod(element, 'setAttribute', ['value', value]);
    } catch (_) {}
    _setShadowInputValue(element, value);
  }

  void _setShadowInputValue(Element element, String value) {
    try {
      final shadowRoot = js_util.getProperty(element, 'shadowRoot');
      if (shadowRoot == null) {
        return;
      }
      final input = js_util.callMethod(shadowRoot, 'querySelector', ['input']);
      if (input == null) {
        return;
      }
      js_util.setProperty(input, 'value', value);
      try {
        js_util.callMethod(input, 'dispatchEvent', [Event('input')]);
        js_util.callMethod(input, 'dispatchEvent', [Event('change')]);
      } catch (_) {}
    } catch (_) {}
  }
}

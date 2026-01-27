// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:async';
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
      final place = _extractPlace(event);
      final placeId = _readString(_getProperty(place, 'id')) ??
          _readString(_getProperty(place, 'placeId')) ??
          '';
      final formattedAddress =
          _readString(_getProperty(place, 'formattedAddress'));
      final displayName = _getProperty(place, 'displayName');
      String? name;
      if (displayName != null) {
        name = _readString(displayName) ??
            _readString(_getProperty(displayName, 'text'));
      }
      name ??= _readString(_getProperty(place, 'name'));
      final location = _getProperty(place, 'location');
      double? lat;
      double? lng;
      if (location != null) {
        try {
          final loc = location as Object;
          lat = (js_util.callMethod(loc, 'lat', []) as num).toDouble();
          lng = (js_util.callMethod(loc, 'lng', []) as num).toDouble();
        } catch (_) {
          lat = null;
          lng = null;
        }
      }
      final displayValue =
          formattedAddress ?? name ?? _readAutocompleteValue(autocomplete);
      onSelected(
        PlaceSelection(
          placeId: placeId,
          displayValue: displayValue,
          name: name,
          formattedAddress: formattedAddress,
          latitude: lat,
          longitude: lng,
        ),
      );
      if (displayValue != null && displayValue.isNotEmpty) {
        scheduleMicrotask(() {
          _setAutocompleteValue(autocomplete, displayValue);
        });
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

  Object? _extractPlace(Object event) {
    final detail = _getProperty(event, 'detail');
    final placeFromDetail = _getProperty(detail, 'place');
    if (placeFromDetail != null) {
      return placeFromDetail;
    }
    final placeFromEvent = _getProperty(event, 'place');
    if (placeFromEvent != null) {
      return placeFromEvent;
    }
    return null;
  }

  Object? _getProperty(Object? object, String name) {
    if (object == null) {
      return null;
    }
    try {
      return js_util.getProperty(object, name);
    } catch (_) {
      return null;
    }
  }

  String? _readString(Object? value) {
    if (value is String) {
      final trimmed = value.trim();
      if (trimmed.isNotEmpty) {
        return trimmed;
      }
    }
    return null;
  }

  String? _readAutocompleteValue(Element element) {
    try {
      final value =
          _readString(js_util.getProperty(element, 'value')) ??
              _readString(js_util.getProperty(element, 'inputValue')) ??
              _readString(js_util.getProperty(element, 'query'));
      if (value != null) {
        return value;
      }
    } catch (_) {}
    try {
      final attr = element.getAttribute('value');
      final attrValue = _readString(attr);
      if (attrValue != null) {
        return attrValue;
      }
    } catch (_) {}
    try {
      final shadowRoot = js_util.getProperty(element, 'shadowRoot');
      if (shadowRoot == null) {
        return null;
      }
      final input =
          js_util.callMethod(shadowRoot, 'querySelector', ['input']);
      final inputValue = _readString(js_util.getProperty(input, 'value'));
      if (inputValue != null) {
        return inputValue;
      }
    } catch (_) {}
    return null;
  }
}

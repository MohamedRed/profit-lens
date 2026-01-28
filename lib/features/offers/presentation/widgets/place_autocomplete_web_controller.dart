// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:async';
import 'dart:html';
import 'package:flutter/foundation.dart';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;
import '../../../../core/config/google_maps_config.dart';
import '../../../../core/web/google_maps_loader_web.dart';
import '../../domain/place_selection.dart';
import 'place_autocomplete_web_dom_helper.dart';
import 'place_autocomplete_web_place_details.dart';
import 'place_autocomplete_web_style.dart';
import 'place_autocomplete_web_utils.dart';

class PlaceAutocompleteWebController {
  final DivElement container;
  final String countryCode;
  final void Function(PlaceSelection selection) onSelected;
  final ValueChanged<double>? onDropdownHeightChanged;
  final ValueChanged<String>? onInputValueChanged;
  final ValueChanged<bool>? onDropdownOpenChanged;

  Element? _autocompleteElement;
  EventListener? _selectListener;
  EventListener? _inputListener;
  EventListener? _blurListener;
  EventListener? _focusListener;
  String? _lastDisplayValue;
  String? _lastTypedValue;
  PlaceAutocompleteDomHelper? _domHelper;
  static const double _fallbackDropdownHeight = 240;

  PlaceAutocompleteWebController({
    required this.container,
    required this.countryCode,
    required this.onSelected,
    this.onDropdownHeightChanged,
    this.onInputValueChanged,
    this.onDropdownOpenChanged,
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
    if (_autocompleteElement != null && _inputListener != null) {
      _autocompleteElement!.removeEventListener('input', _inputListener);
      _autocompleteElement!.removeEventListener('gmp-input', _inputListener);
    }
    if (_autocompleteElement != null && _blurListener != null) {
      _autocompleteElement!.removeEventListener('blur', _blurListener);
      _autocompleteElement!.removeEventListener('focusout', _blurListener);
    }
    if (_autocompleteElement != null && _focusListener != null) {
      _autocompleteElement!.removeEventListener('focus', _focusListener);
      _autocompleteElement!.removeEventListener('focusin', _focusListener);
    }
    _domHelper?.dispose();
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

    _inputListener = (_) {
      final value = _domHelper?.readAutocompleteValue();
      if (value != null && value.isNotEmpty) {
        _lastTypedValue = value;
        onInputValueChanged?.call(value);
      }
      onDropdownHeightChanged?.call(_fallbackDropdownHeight);
      onDropdownOpenChanged?.call(true);
    };
    autocomplete.addEventListener('input', _inputListener);
    autocomplete.addEventListener('gmp-input', _inputListener);

    _focusListener = (_) {
      onDropdownOpenChanged?.call(true);
      onDropdownHeightChanged?.call(_fallbackDropdownHeight);
    };
    autocomplete.addEventListener('focus', _focusListener);
    autocomplete.addEventListener('focusin', _focusListener);

    _blurListener = (_) {
      onDropdownHeightChanged?.call(0);
      onDropdownOpenChanged?.call(false);
    };
    autocomplete.addEventListener('blur', _blurListener);
    autocomplete.addEventListener('focusout', _blurListener);

    _selectListener = (event) {
      final place =
          extractPlaceFromEvent(event) ?? getJsProperty(autocomplete, 'place');
      final placeJson = place == null
          ? null
          : PlaceAutocompleteWebPlaceDetails.readPlaceJson(place);
      if (kDebugMode && place != null) {
        try {
          final objectCtor = js_util.getProperty(window, 'Object');
          final keys = js_util.callMethod(objectCtor, 'keys', [place]);
          // ignore: avoid_print
          print('PlacesUI place keys: ${js_util.dartify(keys)}');
        } catch (_) {}
        if (placeJson != null) {
          // ignore: avoid_print
          print('PlacesUI place json: $placeJson');
        }
      }
      final placeId = readJsString(getJsProperty(place, 'id')) ??
          readJsString(getJsProperty(place, 'placeId')) ??
          readJsString(placeJson?['id']) ??
          readJsString(placeJson?['placeId']) ??
          '';
      final formattedAddress =
          readJsString(getJsProperty(place, 'formattedAddress')) ??
              readJsString(placeJson?['formattedAddress']) ??
              readJsString(placeJson?['formatted_address']);
      final displayName =
          getJsProperty(place, 'displayName') ?? placeJson?['displayName'];
      String? name;
      if (displayName != null) {
        name = readJsString(displayName) ??
            readJsString(getJsProperty(displayName, 'text'));
      }
      name ??= readJsString(getJsProperty(place, 'name')) ??
          readJsString(placeJson?['name']) ??
          readJsString(placeJson?['displayName']);
      final location = getJsProperty(place, 'location');
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
      if (lat == null || lng == null) {
        final locationJson = placeJson?['location'];
        if (locationJson is Map) {
          final latValue = locationJson['lat'];
          final lngValue = locationJson['lng'];
          if (latValue is num) {
            lat = latValue.toDouble();
          }
          if (lngValue is num) {
            lng = lngValue.toDouble();
          }
        }
      }
      final eventDisplayValue = readEventDisplayValue(event);
      if (eventDisplayValue != null) {
        _lastTypedValue = eventDisplayValue;
      }
      final displayValue = formattedAddress ??
          name ??
          eventDisplayValue ??
          _domHelper?.readAutocompleteValue() ??
          _lastTypedValue;
      if (kDebugMode) {
        // ignore: avoid_print
        print('PlacesUI select event: ${getJsProperty(event, "type")}');
        // ignore: avoid_print
        print('PlacesUI detail: ${getJsProperty(event, "detail")}');
        // ignore: avoid_print
        print('PlacesUI place: $place');
        // ignore: avoid_print
        print('PlacesUI displayValue: $displayValue');
        // ignore: avoid_print
        print('PlacesUI inputValue: ${_domHelper?.readAutocompleteValue()}');
      }
      final selection = PlaceSelection(
        placeId: placeId,
        displayValue: displayValue,
        name: name,
        formattedAddress: formattedAddress,
        latitude: lat,
        longitude: lng,
      );
      onSelected(selection);
      final fallbackValue = displayValue ?? _domHelper?.readAutocompleteValue();
      if (fallbackValue != null && fallbackValue.isNotEmpty) {
        onInputValueChanged?.call(fallbackValue);
      }
      if (displayValue != null && displayValue.isNotEmpty) {
        scheduleMicrotask(() {
          _setAutocompleteValue(autocomplete, displayValue);
        });
      }
      if ((displayValue == null || displayValue.isEmpty) && placeId.isNotEmpty) {
        PlaceAutocompleteWebPlaceDetails.fetchPlaceDetails(placeId).then((resolved) {
          if (resolved == null) {
            return;
          }
          final resolvedValue = resolved.displayValue ??
              resolved.formattedAddress ??
              resolved.name;
          if (resolvedValue != null && resolvedValue.isNotEmpty) {
            onInputValueChanged?.call(resolvedValue);
            _setAutocompleteValue(autocomplete, resolvedValue);
          }
          onSelected(resolved);
        });
      }
      Future.delayed(const Duration(milliseconds: 100), () {
        final delayedValue = _domHelper?.readAutocompleteValue();
        if (delayedValue != null && delayedValue.isNotEmpty) {
          onInputValueChanged?.call(delayedValue);
        }
      });
      onDropdownHeightChanged?.call(0);
      onDropdownOpenChanged?.call(false);
    };
    autocomplete.addEventListener('gmp-select', _selectListener);
    autocomplete.addEventListener('gmp-placeselect', _selectListener);
    autocomplete.addEventListener('gmp-placechange', _selectListener);
    autocomplete.addEventListener('gmp-placechanged', _selectListener);
    autocomplete.addEventListener('place_changed', _selectListener);

    _domHelper = PlaceAutocompleteDomHelper(
      container: container,
      autocomplete: autocomplete,
      onDropdownHeightChanged: onDropdownHeightChanged,
      onDropdownOpenChanged: onDropdownOpenChanged,
      onListClickValue: (value) {
        onInputValueChanged?.call(value);
        onSelected(
          PlaceSelection(
            placeId: readJsString(getJsProperty(autocomplete, 'placeId')) ?? '',
            displayValue: value,
          ),
        );
      },
    );
    _domHelper?.attach(
      inputListener: _inputListener,
      focusListener: _focusListener,
      blurListener: _blurListener,
    );

    container.children
      ..clear()
      ..add(autocomplete);
    _autocompleteElement = autocomplete;
    scheduleMicrotask(() {
      _domHelper?.attach(
        inputListener: _inputListener,
        focusListener: _focusListener,
        blurListener: _blurListener,
      );
    });
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

  String? get lastTypedValue => _lastTypedValue;

  String? readCurrentValue() => _domHelper?.readAutocompleteValue();
}

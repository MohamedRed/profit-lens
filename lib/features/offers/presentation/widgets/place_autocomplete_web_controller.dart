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
import 'place_autocomplete_web_selection_builder.dart';
import 'place_autocomplete_web_style.dart';
import 'place_autocomplete_web_utils.dart';
import 'place_autocomplete_web_value_setter.dart';

class PlaceAutocompleteWebController {
  final DivElement container;
  final String countryCode;
  final String? placeholder;
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
    this.placeholder,
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
      final result = buildSelectionFromEvent(
        event: event,
        autocomplete: autocomplete,
        domHelper: _domHelper,
        lastTypedValue: _lastTypedValue,
      );
      if (result.typedValue != null) {
        _lastTypedValue = result.typedValue;
      }
      final selection = result.selection;
      final displayValue = result.displayValue;
      onSelected(selection);
      final fallbackValue = displayValue ?? _domHelper?.readAutocompleteValue();
      if (fallbackValue != null && fallbackValue.isNotEmpty) {
        onInputValueChanged?.call(fallbackValue);
      }
      if (displayValue != null && displayValue.isNotEmpty) {
        scheduleMicrotask(() {
          if (displayValue == _lastDisplayValue) {
            return;
          }
          _lastDisplayValue = displayValue;
          setAutocompleteElementValue(autocomplete, displayValue);
        });
      }
      if ((displayValue == null || displayValue.isEmpty) &&
          selection.placeId.isNotEmpty) {
        PlaceAutocompleteWebPlaceDetails.fetchPlaceDetails(selection.placeId)
            .then((resolved) {
          if (resolved == null) {
            return;
          }
          final resolvedValue = resolved.displayValue ??
              resolved.formattedAddress ??
              resolved.name;
          if (resolvedValue != null && resolvedValue.isNotEmpty) {
            onInputValueChanged?.call(resolvedValue);
            if (resolvedValue != _lastDisplayValue) {
              _lastDisplayValue = resolvedValue;
              setAutocompleteElementValue(autocomplete, resolvedValue);
            }
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
    if (placeholder != null) {
      _domHelper?.setInputPlaceholder(placeholder);
    }

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
      if (placeholder != null) {
        _domHelper?.setInputPlaceholder(placeholder);
      }
    });
  }

  String? get lastTypedValue => _lastTypedValue;

  String? readCurrentValue() => _domHelper?.readAutocompleteValue();
}

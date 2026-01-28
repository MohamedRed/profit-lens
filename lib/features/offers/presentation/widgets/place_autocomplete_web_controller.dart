// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:async';
import 'dart:html';
import 'package:flutter/foundation.dart';
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
  final ValueChanged<double>? onDropdownHeightChanged;
  final ValueChanged<String>? onInputValueChanged;
  final ValueChanged<bool>? onDropdownOpenChanged;
  Element? _autocompleteElement;
  EventListener? _selectListener;
  EventListener? _inputListener;
  EventListener? _blurListener;
  String? _lastDisplayValue;
  String? _lastTypedValue;
  MutationObserver? _listObserver;
  InputElement? _inputElement;
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
    if (_inputElement != null && _inputListener != null) {
      _inputElement!.removeEventListener('input', _inputListener);
      _inputElement!.removeEventListener('change', _inputListener);
    }
    _listObserver?.disconnect();
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
      final value = _readAutocompleteValue(autocomplete);
      if (value != null && value.isNotEmpty) {
        onInputValueChanged?.call(value);
      }
      onDropdownHeightChanged?.call(_fallbackDropdownHeight);
      onDropdownOpenChanged?.call(true);
    };
    autocomplete.addEventListener('input', _inputListener);
    autocomplete.addEventListener('gmp-input', _inputListener);
    _blurListener = (_) {
      onDropdownHeightChanged?.call(0);
      onDropdownOpenChanged?.call(false);
    };
    autocomplete.addEventListener('blur', _blurListener);
    autocomplete.addEventListener('focusout', _blurListener);

    _selectListener = (event) {
      final place = _extractPlace(event) ?? _getProperty(autocomplete, 'place');
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
      final displayValue = formattedAddress ??
          name ??
          _readEventDisplayValue(event) ??
          _readAutocompleteValue(autocomplete) ??
          _lastTypedValue;
      if (kDebugMode) {
        // ignore: avoid_print
        print('PlacesUI select event: ${_getProperty(event, "type")}');
        // ignore: avoid_print
        print('PlacesUI detail: ${_getProperty(event, "detail")}');
        // ignore: avoid_print
        print('PlacesUI place: $place');
        // ignore: avoid_print
        print('PlacesUI displayValue: $displayValue');
        // ignore: avoid_print
        print('PlacesUI inputValue: ${_readAutocompleteValue(autocomplete)}');
      }
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
      final fallbackValue =
          displayValue ?? _readAutocompleteValue(autocomplete);
      if (fallbackValue != null && fallbackValue.isNotEmpty) {
        onInputValueChanged?.call(fallbackValue);
      }
      if (displayValue != null && displayValue.isNotEmpty) {
        scheduleMicrotask(() {
          _setAutocompleteValue(autocomplete, displayValue);
        });
      }
      onDropdownHeightChanged?.call(0);
      onDropdownOpenChanged?.call(false);
    };
    autocomplete.addEventListener('gmp-select', _selectListener);
    autocomplete.addEventListener('gmp-placeselect', _selectListener);
    autocomplete.addEventListener('gmp-placechange', _selectListener);
    autocomplete.addEventListener('gmp-placechanged', _selectListener);
    autocomplete.addEventListener('place_changed', _selectListener);
    _attachListObserver(autocomplete);
    container.children
      ..clear()
      ..add(autocomplete)
      ;
    _autocompleteElement = autocomplete;
    scheduleMicrotask(() {
      _raiseHostZIndex();
      _syncInputElement(autocomplete);
    });
    window.requestAnimationFrame((_) {
      _raiseHostZIndex();
      _syncInputElement(autocomplete);
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
        _lastTypedValue = value;
        return value;
      }
    } catch (_) {}
    try {
      final attr = element.getAttribute('value');
      final attrValue = _readString(attr);
      if (attrValue != null) {
        _lastTypedValue = attrValue;
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
        _lastTypedValue = inputValue;
        return inputValue;
      }
    } catch (_) {}
    return null;
  }

  String? _readEventDisplayValue(Object event) {
    final detail = _getProperty(event, 'detail');
    final displayText = _readString(_getProperty(detail, 'text')) ??
        _readString(_getProperty(detail, 'value')) ??
        _readString(_getProperty(detail, 'inputValue')) ??
        _readString(_getProperty(detail, 'query')) ??
        _readString(_getProperty(detail, 'description'));
    if (displayText != null) {
      _lastTypedValue = displayText;
      return displayText;
    }
    final prediction = _getProperty(detail, 'placePrediction');
    final predictionText = _readString(_getProperty(prediction, 'text')) ??
        _readString(_getProperty(prediction, 'description'));
    if (predictionText != null) {
      _lastTypedValue = predictionText;
      return predictionText;
    }
    final selected = _getProperty(detail, 'selection');
    final selectionText = _readString(_getProperty(selected, 'text')) ??
        _readString(_getProperty(selected, 'description'));
    if (selectionText != null) {
      _lastTypedValue = selectionText;
      return selectionText;
    }
    return null;
  }

  void _attachListObserver(HtmlElement autocomplete) {
    _listObserver?.disconnect();
    final shadowRoot = _getShadowRoot(autocomplete);
    if (shadowRoot == null) {
      return;
    }
    _listObserver = MutationObserver((_, __) {
      _emitListHeight(autocomplete);
      _syncInputElement(autocomplete);
      _attachListClickListener(autocomplete);
    });
    _listObserver!.observe(
      shadowRoot,
      attributes: true,
      childList: true,
      subtree: true,
    );
    _emitListHeight(autocomplete);
    _syncInputElement(autocomplete);
    _attachListClickListener(autocomplete);
  }

  ShadowRoot? _getShadowRoot(HtmlElement element) {
    final directRoot = element.shadowRoot;
    if (directRoot != null) {
      return directRoot;
    }
    try {
      final root = js_util.getProperty(element, 'shadowRoot');
      if (root is ShadowRoot) {
        return root;
      }
    } catch (_) {}
    return null;
  }

  void _emitListHeight(HtmlElement autocomplete) {
    final list = _findListElement(autocomplete);
    final height = list?.getBoundingClientRect().height ?? 0;
    final clampedHeight = (height.isNaN ? 0 : height).toDouble();
    onDropdownHeightChanged?.call(clampedHeight);
    onDropdownOpenChanged?.call(clampedHeight > 0);
  }

  Element? _findListElement(HtmlElement autocomplete) {
    final shadowRoot = _getShadowRoot(autocomplete);
    if (shadowRoot == null) {
      return null;
    }
    return shadowRoot.querySelector('[part=\"listbox\"]') ??
        shadowRoot.querySelector('[part=\"listbox-container\"]') ??
        shadowRoot.querySelector('gmp-place-list');
  }

  String? get lastTypedValue => _lastTypedValue;

  String? readCurrentValue() {
    final element = _autocompleteElement;
    if (element == null) {
      return null;
    }
    return _readAutocompleteValue(element);
  }

  void _syncInputElement(HtmlElement autocomplete) {
    if (_inputElement != null) {
      return;
    }
    final shadowRoot = _getShadowRoot(autocomplete);
    if (shadowRoot == null) {
      return;
    }
    final input = shadowRoot.querySelector('input');
    if (input is InputElement) {
      _inputElement = input;
      if (_inputListener != null) {
        _inputElement!.addEventListener('input', _inputListener);
        _inputElement!.addEventListener('change', _inputListener);
      }
    }
  }

  void _attachListClickListener(HtmlElement autocomplete) {
    final list = _findListElement(autocomplete);
    if (list == null) {
      return;
    }
    list.onClick.listen((_) {
      scheduleMicrotask(() {
        final displayValue = _readAutocompleteValue(autocomplete);
        if (displayValue == null || displayValue.isEmpty) {
          return;
        }
        onSelected(
          PlaceSelection(
            placeId: _readString(_getProperty(autocomplete, 'placeId')) ?? '',
            displayValue: displayValue,
          ),
        );
      });
    });
  }

  void _raiseHostZIndex() {
    container.style
      ..position = 'relative'
      ..zIndex = '10000'
      ..overflow = 'visible';
    final parent = container.parent;
    if (parent is HtmlElement) {
      parent.style
        ..position = 'relative'
        ..zIndex = '10000'
        ..overflow = 'visible';
      final grand = parent.parent;
      if (grand is HtmlElement) {
        grand.style
          ..position = 'relative'
          ..zIndex = '10000'
          ..overflow = 'visible';
      }
    }
  }
}

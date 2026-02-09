// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;
import 'package:flutter/foundation.dart';

class PlaceAutocompleteDomHelper {
  final DivElement container;
  final HtmlElement autocomplete;
  final ValueChanged<double>? onDropdownHeightChanged;
  final ValueChanged<bool>? onDropdownOpenChanged;
  final ValueChanged<String>? onListClickValue;

  MutationObserver? _listObserver;
  InputElement? _inputElement;
  EventListener? _inputListener;
  EventListener? _focusListener;
  EventListener? _blurListener;
  String? _inputPlaceholder;

  PlaceAutocompleteDomHelper({
    required this.container,
    required this.autocomplete,
    this.onDropdownHeightChanged,
    this.onDropdownOpenChanged,
    this.onListClickValue,
  });

  void attach({
    EventListener? inputListener,
    EventListener? focusListener,
    EventListener? blurListener,
  }) {
    _inputListener = inputListener;
    _focusListener = focusListener;
    _blurListener = blurListener;
    _raiseHostZIndex();
    _attachListObserver();
    _syncInputElement();
  }

  void setInputPlaceholder(String? placeholder) {
    _inputPlaceholder = placeholder;
    _applyPlaceholder();
  }

  void dispose() {
    _listObserver?.disconnect();
    if (_inputElement != null && _inputListener != null) {
      _inputElement!.removeEventListener('input', _inputListener);
      _inputElement!.removeEventListener('change', _inputListener);
    }
    if (_inputElement != null && _focusListener != null) {
      _inputElement!.removeEventListener('focus', _focusListener);
      _inputElement!.removeEventListener('focusin', _focusListener);
    }
    if (_inputElement != null && _blurListener != null) {
      _inputElement!.removeEventListener('blur', _blurListener);
      _inputElement!.removeEventListener('focusout', _blurListener);
    }
  }

  String? readAutocompleteValue() {
    try {
      final value =
          _readString(js_util.getProperty(autocomplete, 'value')) ??
          _readString(js_util.getProperty(autocomplete, 'inputValue')) ??
          _readString(js_util.getProperty(autocomplete, 'query'));
      if (value != null) {
        return value;
      }
    } catch (_) {}
    try {
      final attr = autocomplete.getAttribute('value');
      final attrValue = _readString(attr);
      if (attrValue != null) {
        return attrValue;
      }
    } catch (_) {}
    try {
      final shadowRoot = _getShadowRoot(autocomplete);
      if (shadowRoot == null) {
        return null;
      }
      final input = shadowRoot.querySelector('input');
      final inputValue = _readString(input?.getAttribute('value'));
      if (inputValue != null) {
        return inputValue;
      }
    } catch (_) {}
    return null;
  }

  void _attachListObserver() {
    _listObserver?.disconnect();
    final shadowRoot = _getShadowRoot(autocomplete);
    if (shadowRoot == null) {
      return;
    }
    _listObserver = MutationObserver((mutations, observer) {
      _emitListHeight();
      _syncInputElement();
      _attachListClickListener();
    });
    _listObserver!.observe(
      shadowRoot,
      attributes: true,
      childList: true,
      subtree: true,
    );
    _emitListHeight();
    _syncInputElement();
    _attachListClickListener();
  }

  void _emitListHeight() {
    final list = _findListElement();
    final height = list?.getBoundingClientRect().height ?? 0;
    final clampedHeight = (height.isNaN ? 0 : height).toDouble();
    onDropdownHeightChanged?.call(clampedHeight);
    onDropdownOpenChanged?.call(clampedHeight > 0);
  }

  void _syncInputElement() {
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
      if (_focusListener != null) {
        _inputElement!.addEventListener('focus', _focusListener);
        _inputElement!.addEventListener('focusin', _focusListener);
      }
      if (_blurListener != null) {
        _inputElement!.addEventListener('blur', _blurListener);
        _inputElement!.addEventListener('focusout', _blurListener);
      }
      _applyPlaceholder();
    }
  }

  void _applyPlaceholder() {
    if (_inputElement == null) {
      return;
    }
    final placeholder = _inputPlaceholder;
    if (placeholder == null) {
      return;
    }
    _inputElement!.placeholder = placeholder;
  }

  void _attachListClickListener() {
    final list = _findListElement();
    if (list == null) {
      return;
    }
    list.onClick.listen((event) {
      final target = event.target;
      Element? item;
      if (target is Element) {
        item =
            target.closest('[role="option"]') ??
            target.closest('gmp-place-list-item') ??
            target;
      }
      final value =
          readAutocompleteValue() ??
          _readString(item?.text) ??
          _readString(item?.innerText);
      if (value != null && value.isNotEmpty) {
        onListClickValue?.call(value);
      }
    });
  }

  Element? _findListElement() {
    final shadowRoot = _getShadowRoot(autocomplete);
    if (shadowRoot == null) {
      return null;
    }
    return shadowRoot.querySelector('[part="listbox"]') ??
        shadowRoot.querySelector('[part="listbox-container"]') ??
        shadowRoot.querySelector('gmp-place-list');
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
}

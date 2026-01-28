// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;

Object? getJsProperty(Object? object, String name) {
  if (object == null) {
    return null;
  }
  try {
    return js_util.getProperty(object, name);
  } catch (_) {
    return null;
  }
}

String? readJsString(Object? value) {
  if (value is String) {
    final trimmed = value.trim();
    if (trimmed.isNotEmpty) {
      return trimmed;
    }
  }
  return null;
}

Object? extractPlaceFromEvent(Object event) {
  final detail = getJsProperty(event, 'detail');
  final placeFromDetail = getJsProperty(detail, 'place');
  if (placeFromDetail != null) {
    return placeFromDetail;
  }
  final placeFromEvent = getJsProperty(event, 'place');
  if (placeFromEvent != null) {
    return placeFromEvent;
  }
  return null;
}

String? readEventDisplayValue(Object event) {
  final detail = getJsProperty(event, 'detail');
  final displayText = readJsString(getJsProperty(detail, 'text')) ??
      readJsString(getJsProperty(detail, 'value')) ??
      readJsString(getJsProperty(detail, 'inputValue')) ??
      readJsString(getJsProperty(detail, 'query')) ??
      readJsString(getJsProperty(detail, 'description'));
  if (displayText != null) {
    return displayText;
  }
  final prediction = getJsProperty(detail, 'placePrediction');
  final predictionText = readJsString(getJsProperty(prediction, 'text')) ??
      readJsString(getJsProperty(prediction, 'description'));
  if (predictionText != null) {
    return predictionText;
  }
  final selected = getJsProperty(detail, 'selection');
  final selectionText = readJsString(getJsProperty(selected, 'text')) ??
      readJsString(getJsProperty(selected, 'description'));
  if (selectionText != null) {
    return selectionText;
  }
  return null;
}

void setShadowInputValue(Element element, String value) {
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

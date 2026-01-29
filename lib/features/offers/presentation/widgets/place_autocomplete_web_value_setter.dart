// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;

void setAutocompleteElementValue(Element element, String value) {
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

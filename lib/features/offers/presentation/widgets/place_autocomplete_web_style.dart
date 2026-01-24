// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';

void stylePlacesAutocomplete(HtmlElement element) {
  element.style
    ..width = '100%'
    ..height = '48px'
    ..display = 'block'
    ..border = '1px solid rgba(0, 0, 0, 0.38)'
    ..borderRadius = '8px'
    ..padding = '0 12px'
    ..boxSizing = 'border-box'
    ..backgroundColor = 'white'
    ..color = 'inherit'
    ..fontFamily = 'inherit';
}

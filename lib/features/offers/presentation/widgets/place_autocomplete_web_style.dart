// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';

const _styleElementId = 'pl-autocomplete-style';
const _className = 'pl-autocomplete';

void stylePlacesAutocomplete(HtmlElement element) {
  element.classes.add(_className);
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
  element.style
    ..setProperty('--gmp-color-outline', 'rgba(0, 0, 0, 0.38)')
    ..setProperty('--gmp-color-background', '#ffffff')
    ..setProperty('--gmp-color-on-surface', 'inherit')
    ..setProperty('--gmp-color-surface', '#ffffff')
    ..setProperty('--gmp-font-family', 'inherit')
    ..setProperty('--gmp-font-size-base', '14px')
    ..setProperty('--gmp-autocomplete-border-radius', '8px')
    ..setProperty('--gmp-autocomplete-list-max-height', 'min(240px, 45vh)')
    ..setProperty('--gmp-autocomplete-list-min-height', '0px');

  if (document.getElementById(_styleElementId) != null) {
    return;
  }
  final style = StyleElement()..id = _styleElementId;
  style.appendText('''
    .$_className::part(input) {
      height: 48px;
      padding: 0 12px;
      box-sizing: border-box;
    }
    .$_className::part(listbox),
    .$_className::part(listbox-container) {
      max-height: min(240px, 45vh);
      height: auto;
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    .$_className gmp-place-list {
      max-height: min(240px, 45vh) !important;
    }
  ''');
  document.head?.append(style);
}

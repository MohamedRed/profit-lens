// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;
import '../../../../core/config/google_maps_config.dart';
import '../../../../core/web/google_maps_loader_web.dart';
import '../../domain/place_selection.dart';
class PlaceAutocompleteWebController {
  final DivElement container;
  final String countryCode;
  final void Function(PlaceSelection selection) onSelected;
  Element? _autocompleteElement;
  Element? _detailsElement;
  EventListener? _selectListener;
  EventListener? _detailsLoadListener;
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
    final maps = js_util.getProperty(js_util.getProperty(window, 'google'), 'maps');
    final placesLibrary = await js_util.promiseToFuture(
      js_util.callMethod(maps, 'importLibrary', ['places']),
    );
    _mountAutocomplete(placesLibrary);
  }
  void dispose() {
    if (_autocompleteElement != null && _selectListener != null) {
      _autocompleteElement!.removeEventListener('gmp-select', _selectListener);
    }
    if (_detailsElement != null && _detailsLoadListener != null) {
      _detailsElement!.removeEventListener('gmp-load', _detailsLoadListener);
    }
  }
  void _mountAutocomplete(Object placesLibrary) {
    final constructor = js_util.getProperty(placesLibrary, 'BasicPlaceAutocompleteElement');
    final options = js_util.jsify({'includedRegionCodes': [countryCode.toLowerCase()]});
    final autocomplete = js_util.callConstructor(constructor, [options]) as HtmlElement;
    _styleAutocomplete(autocomplete);
    final detailsElement = Element.tag('gmp-place-details-compact');
    final detailsRequest = Element.tag('gmp-place-details-place-request');
    detailsElement.append(detailsRequest);
    detailsElement.style.display = 'none';
    _selectListener = (event) {
      final place = js_util.getProperty(event, 'place');
      final placeId = js_util.getProperty(place, 'id') as String?;
      if (placeId == null) {
        return;
      }
      js_util.setProperty(detailsRequest, 'place', placeId);
    };
    _detailsLoadListener = (event) {
      final place = js_util.getProperty(detailsElement, 'place');
      final formattedAddress = js_util.getProperty(place, 'formattedAddress') as String?;
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
          placeId: js_util.getProperty(place, 'id') as String? ?? '',
          formattedAddress: formattedAddress,
          latitude: lat,
          longitude: lng,
        ),
      );
    };
    autocomplete.addEventListener('gmp-select', _selectListener);
    detailsElement.addEventListener('gmp-load', _detailsLoadListener);
    container.children
      ..clear()
      ..add(autocomplete)
      ..add(detailsElement);
    _autocompleteElement = autocomplete;
    _detailsElement = detailsElement;
  }
  void _styleAutocomplete(HtmlElement autocomplete) {
    autocomplete.style
      ..width = '100%'
      ..height = '48px'
      ..border = '1px solid rgba(0, 0, 0, 0.38)'
      ..borderRadius = '8px'
      ..padding = '0 12px'
      ..boxSizing = 'border-box';
  }
}

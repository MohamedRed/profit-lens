// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
import 'package:flutter/foundation.dart';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;

import '../../domain/place_selection.dart';
import 'place_autocomplete_web_dom_helper.dart';
import 'place_autocomplete_web_place_details.dart';
import 'place_autocomplete_web_utils.dart';

class PlaceSelectionResult {
  final PlaceSelection selection;
  final String? displayValue;
  final String? typedValue;

  const PlaceSelectionResult({
    required this.selection,
    required this.displayValue,
    required this.typedValue,
  });
}

PlaceSelectionResult buildSelectionFromEvent({
  required Event event,
  required HtmlElement autocomplete,
  required PlaceAutocompleteDomHelper? domHelper,
  String? lastTypedValue,
}) {
  final place = extractPlaceFromEvent(event) ?? getJsProperty(autocomplete, 'place');
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
  final displayName = getJsProperty(place, 'displayName') ?? placeJson?['displayName'];
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
      lat = (js_util.callMethod(location, 'lat', []) as num).toDouble();
      lng = (js_util.callMethod(location, 'lng', []) as num).toDouble();
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
  final displayValue = formattedAddress ??
      name ??
      eventDisplayValue ??
      domHelper?.readAutocompleteValue() ??
      lastTypedValue;
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
    print('PlacesUI inputValue: ${domHelper?.readAutocompleteValue()}');
  }
  return PlaceSelectionResult(
    selection: PlaceSelection(
      placeId: placeId,
      displayValue: displayValue,
      name: name,
      formattedAddress: formattedAddress,
      latitude: lat,
      longitude: lng,
    ),
    displayValue: displayValue,
    typedValue: eventDisplayValue,
  );
}

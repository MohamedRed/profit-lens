// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:async';
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;
import '../../domain/place_selection.dart';

class PlaceAutocompleteWebPlaceDetails {
  static Map<String, dynamic>? readPlaceJson(Object place) {
    try {
      final json = js_util.callMethod(place, 'toJSON', []);
      final dartified = js_util.dartify(json);
      if (dartified is Map) {
        return dartified.cast<String, dynamic>();
      }
    } catch (_) {}
    return null;
  }

  static Future<PlaceSelection?> fetchPlaceDetails(String placeId) async {
    try {
      final google = js_util.getProperty(window, 'google');
      if (google == null) {
        return null;
      }
      final maps = js_util.getProperty(google, 'maps');
      final places = maps == null ? null : js_util.getProperty(maps, 'places');
      if (places == null) {
        return null;
      }
      final placeCtor = js_util.getProperty(places, 'Place');
      if (placeCtor == null) {
        return null;
      }
      final place = js_util.callConstructor(placeCtor, [
        js_util.jsify({'id': placeId}),
      ]);
      final fields = js_util.jsify({
        'fields': ['displayName', 'formattedAddress', 'location'],
      });
      final promise = js_util.callMethod(place, 'fetchFields', [fields]);
      await js_util.promiseToFuture(promise);
      final displayName =
          _readString(js_util.getProperty(place, 'displayName')) ??
          _readString(
            js_util.getProperty(
              js_util.getProperty(place, 'displayName'),
              'text',
            ),
          );
      final formattedAddress = _readString(
        js_util.getProperty(place, 'formattedAddress'),
      );
      final location = js_util.getProperty(place, 'location');
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
      return PlaceSelection(
        placeId: placeId,
        displayValue: formattedAddress ?? displayName,
        name: displayName,
        formattedAddress: formattedAddress,
        latitude: lat,
        longitude: lng,
      );
    } catch (_) {
      return null;
    }
  }

  static String? _readString(Object? value) {
    if (value is String) {
      final trimmed = value.trim();
      if (trimmed.isNotEmpty) {
        return trimmed;
      }
    }
    return null;
  }
}

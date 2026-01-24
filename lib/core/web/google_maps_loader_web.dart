import 'dart:async';
// ignore_for_file: avoid_web_libraries_in_flutter, deprecated_member_use
import 'dart:html';
// ignore: uri_does_not_exist
import 'dart:js_util' as js_util;

class GoogleMapsLoader {
  static Completer<void>? _loader;

  static Future<void> load({required String apiKey}) {
    if (_loader != null) {
      return _loader!.future;
    }
    _loader = Completer<void>();
    if (apiKey.isEmpty) {
      _loader!.completeError(StateError('Missing GOOGLE_MAPS_API_KEY.'));
      return _loader!.future;
    }
    if (_isLoaded()) {
      _loader!.complete();
      return _loader!.future;
    }
    final script = ScriptElement()
      ..async = true
      ..defer = true
      ..src =
          'https://maps.googleapis.com/maps/api/js?key=$apiKey&v=weekly&loading=async&libraries=places';
    script.onError.listen((_) {
      _loader!.completeError(StateError('Failed to load Google Maps JS.'));
    });
    script.onLoad.listen((_) {
      _loader!.complete();
    });
    document.head!.append(script);
    return _loader!.future;
  }

  static bool _isLoaded() {
    if (!js_util.hasProperty(window, 'google')) {
      return false;
    }
    final google = js_util.getProperty(window, 'google');
    return js_util.hasProperty(google, 'maps');
  }
}

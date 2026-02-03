import 'package:flutter/foundation.dart';

import '../config/google_maps_config.dart';
import '../web/google_maps_loader_web.dart';

Future<void> preloadGoogleMaps() async {
  if (!hasGoogleMapsApiKey) {
    return;
  }
  try {
    await GoogleMapsLoader.load(apiKey: googleMapsApiKey);
  } catch (error) {
    if (kDebugMode) {
      debugPrint('Google Maps preload failed: $error');
    }
  }
}

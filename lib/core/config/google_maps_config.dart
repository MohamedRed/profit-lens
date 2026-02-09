const String googleMapsApiKey = String.fromEnvironment('GOOGLE_MAPS_API_KEY');

bool get hasGoogleMapsApiKey => googleMapsApiKey.isNotEmpty;

class AppConfig {
  static const String geminiApiKey = String.fromEnvironment('GEMINI_API_KEY');
  static const String geminiModel =
      String.fromEnvironment('GEMINI_MODEL', defaultValue: 'gemini-1.5-pro');
  static const bool firebaseConfigured =
      bool.fromEnvironment('FIREBASE_CONFIGURED', defaultValue: false);
}

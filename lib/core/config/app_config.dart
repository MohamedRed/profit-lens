class AppConfig {
  static const bool firebaseConfigured =
      bool.fromEnvironment('FIREBASE_CONFIGURED', defaultValue: false);
}

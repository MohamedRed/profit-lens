class AppConfig {
  static const bool firebaseConfigured =
      bool.fromEnvironment('FIREBASE_CONFIGURED', defaultValue: true);
  static const String stripePriceTier9 =
      String.fromEnvironment('STRIPE_PRICE_TIER_9', defaultValue: '');
  static const String stripePriceTier24 =
      String.fromEnvironment('STRIPE_PRICE_TIER_24', defaultValue: '');
  static const String stripePriceTier34 =
      String.fromEnvironment('STRIPE_PRICE_TIER_34', defaultValue: '');
}

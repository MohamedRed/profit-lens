import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show TargetPlatform, defaultTargetPlatform, kIsWeb;

// TODO: Replace this file by running `flutterfire configure`.
class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      throw UnimplementedError('Firebase is not configured for web.');
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        throw UnimplementedError('Firebase is not configured for Android.');
      case TargetPlatform.iOS:
        throw UnimplementedError('Firebase is not configured for iOS.');
      case TargetPlatform.macOS:
        throw UnimplementedError('Firebase is not configured for macOS.');
      case TargetPlatform.windows:
        throw UnimplementedError('Firebase is not configured for Windows.');
      case TargetPlatform.linux:
        throw UnimplementedError('Firebase is not configured for Linux.');
      case TargetPlatform.fuchsia:
        throw UnimplementedError('Firebase is not configured for Fuchsia.');
    }
  }
}

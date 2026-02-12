import 'package:firebase_core/firebase_core.dart';

import 'core/config/app_config.dart';
import 'firebase_options.dart';
import 'firebase_web_plugins.dart';

class FirebaseBootstrap {
  static Future<void>? _initFuture;

  static Future<void> ensureInitialized() async {
    final existingFuture = _initFuture;
    if (existingFuture != null) {
      await existingFuture;
      return;
    }

    final future = _initialize();
    _initFuture = future;
    try {
      await future;
    } catch (_) {
      _initFuture = null;
      rethrow;
    }
  }

  static Future<void> _initialize() async {
    if (!AppConfig.firebaseConfigured) {
      return;
    }
    registerFirebaseWebPlugins();
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
}

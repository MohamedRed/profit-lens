import 'package:firebase_core/firebase_core.dart';

import 'core/config/app_config.dart';
import 'firebase_options.dart';
import 'firebase_web_plugins.dart';

class FirebaseBootstrap {
  static Future<void> ensureInitialized() async {
    if (!AppConfig.firebaseConfigured) {
      return;
    }
    registerFirebaseWebPlugins();
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
}

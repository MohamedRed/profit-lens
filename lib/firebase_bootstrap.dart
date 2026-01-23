import 'package:firebase_core/firebase_core.dart';

import 'core/config/app_config.dart';
import 'firebase_options.dart';

class FirebaseBootstrap {
  static Future<void> ensureInitialized() async {
    if (!AppConfig.firebaseConfigured) {
      return;
    }
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  }
}

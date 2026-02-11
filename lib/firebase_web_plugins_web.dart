import 'package:firebase_storage_web/firebase_storage_web.dart';
import 'package:flutter_web_plugins/flutter_web_plugins.dart';

void registerFirebaseWebPlugins() {
  FirebaseStorageWeb.registerWith(webPluginRegistrar);
}

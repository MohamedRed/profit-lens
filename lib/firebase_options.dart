import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart'
    show TargetPlatform, defaultTargetPlatform, kIsWeb;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform {
    if (kIsWeb) {
      return web;
    }
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        return android;
      case TargetPlatform.iOS:
        return ios;
      case TargetPlatform.macOS:
        return ios;
      case TargetPlatform.windows:
        throw UnsupportedError('Firebase is not configured for Windows.');
      case TargetPlatform.linux:
        throw UnsupportedError('Firebase is not configured for Linux.');
      case TargetPlatform.fuchsia:
        throw UnsupportedError('Firebase is not configured for Fuchsia.');
    }
  }

  static const FirebaseOptions web = FirebaseOptions(
    apiKey: 'AIzaSyAuP4nShQ60Axflrnjvplsro5OD2YjYslM',
    appId: '1:117544150167:web:9a18d96b6b193da94f75d2',
    messagingSenderId: '117544150167',
    projectId: 'profit-lens-prod-2e417',
    authDomain: 'profit-lens-prod-2e417.firebaseapp.com',
    storageBucket: 'profit-lens-prod-2e417.firebasestorage.app',
    measurementId: 'G-NVLEYEKL4N',
  );

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'AIzaSyBU_0OxHo1SsRYnzqKu_7lzQ_DMV4qvGc0',
    appId: '1:117544150167:android:d9b0605fbb5eab8c4f75d2',
    messagingSenderId: '117544150167',
    projectId: 'profit-lens-prod-2e417',
    storageBucket: 'profit-lens-prod-2e417.firebasestorage.app',
  );

  static const FirebaseOptions ios = FirebaseOptions(
    apiKey: 'AIzaSyD2UXraGLWpeReIcLUZQ4sLf8VDW1FkhGo',
    appId: '1:117544150167:ios:c82d1bdd3f3ca0cf4f75d2',
    messagingSenderId: '117544150167',
    projectId: 'profit-lens-prod-2e417',
    storageBucket: 'profit-lens-prod-2e417.firebasestorage.app',
    iosBundleId: 'com.liive.profitLens',
  );
}

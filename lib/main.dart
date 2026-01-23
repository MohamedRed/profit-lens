import 'package:flutter/material.dart';

import 'app/app.dart';
import 'firebase_bootstrap.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await FirebaseBootstrap.ensureInitialized();
  runApp(const ProfitLensApp());
}

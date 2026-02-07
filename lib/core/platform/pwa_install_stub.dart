import 'package:flutter/foundation.dart';

final ValueNotifier<bool> _pwaInstallAvailability = ValueNotifier(false);

ValueListenable<bool> get pwaInstallAvailability => _pwaInstallAvailability;

bool get isPwaInstallAvailable => false;

bool get isAppleInstallManualAvailable => false;

Future<bool> showPwaInstallDialog() async => false;

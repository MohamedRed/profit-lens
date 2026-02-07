import 'package:flutter/foundation.dart';

final ValueNotifier<bool> _pwaUpdateAvailability = ValueNotifier(false);

ValueListenable<bool> get pwaUpdateAvailability => _pwaUpdateAvailability;

Future<void> applyPwaUpdate() async {}

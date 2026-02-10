import 'dart:async';

import 'package:flutter/foundation.dart';

import 'stripe_return_stub.dart'
    if (dart.library.html) 'stripe_return_web.dart';

final ValueNotifier<bool> stripeReturnPending = ValueNotifier<bool>(false);

bool _initialized = false;

void initStripeReturnPending() {
  if (_initialized) {
    return;
  }
  _initialized = true;
  if (!kIsWeb) {
    return;
  }
  if (!stripeReturnParamPresent()) {
    return;
  }
  stripeReturnPending.value = true;
  clearStripeReturnParam();
  Timer(const Duration(seconds: 8), () {
    if (stripeReturnPending.value) {
      stripeReturnPending.value = false;
    }
  });
}

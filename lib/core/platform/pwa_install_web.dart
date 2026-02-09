import 'dart:async';
import 'dart:html' as html;

import 'package:flutter/foundation.dart';

bool _listenerRegistered = false;
dynamic _deferredPromptEvent;

final ValueNotifier<bool> _pwaInstallAvailability = ValueNotifier(false);

ValueListenable<bool> get pwaInstallAvailability {
  _ensureBeforeInstallPromptListener();
  final deferredEvent = _getDeferredPromptEvent();
  if (!_isStandalone &&
      deferredEvent != null &&
      !_pwaInstallAvailability.value) {
    scheduleMicrotask(() {
      if (!_pwaInstallAvailability.value) {
        _pwaInstallAvailability.value = true;
      }
    });
  }
  return _pwaInstallAvailability;
}

void _ensureBeforeInstallPromptListener() {
  if (_listenerRegistered) {
    return;
  }
  _listenerRegistered = true;

  html.window.addEventListener('beforeinstallprompt', (event) {
    event.preventDefault();
    final jsEvent = event as dynamic;
    _deferredPromptEvent = jsEvent;
    try {
      (html.window as dynamic).defferedPromptEvent = jsEvent;
    } catch (_) {}
    _pwaInstallAvailability.value = !_isStandalone;
  });

  html.window.addEventListener('appinstalled', (_) {
    _deferredPromptEvent = null;
    try {
      (html.window as dynamic).defferedPromptEvent = null;
    } catch (_) {}
    _pwaInstallAvailability.value = false;
  });
}

dynamic _getDeferredPromptEvent() {
  if (_deferredPromptEvent != null) {
    return _deferredPromptEvent;
  }

  try {
    final globalEvent = (html.window as dynamic).defferedPromptEvent;
    if (globalEvent != null) {
      _deferredPromptEvent = globalEvent;
    }
  } catch (_) {}

  return _deferredPromptEvent;
}

bool get isPwaInstallAvailable {
  _ensureBeforeInstallPromptListener();
  if (_isStandalone) {
    return false;
  }
  if (_isIosDevice) {
    return true;
  }
  return _pwaInstallAvailability.value;
}

bool get isAppleInstallManualAvailable {
  if (_isStandalone) {
    return false;
  }
  return _isIosDevice;
}

bool get isPwaInstalled => _isStandalone;
bool get isIosPwaInstalled => _isStandalone && _isIosDevice;

Future<bool> showPwaInstallDialog() async {
  _ensureBeforeInstallPromptListener();

  if (_isIosDevice) {
    return _showAppleInstallDialog();
  }

  final deferredEvent = _getDeferredPromptEvent();
  if (deferredEvent == null) {
    html.window.console.warn('beforeinstallprompt not available');
    return false;
  }

  try {
    (deferredEvent as dynamic).prompt();
  } catch (_) {
    return false;
  }

  await _waitForUserChoice(deferredEvent);

  _deferredPromptEvent = null;
  try {
    (html.window as dynamic).defferedPromptEvent = null;
  } catch (_) {}
  _pwaInstallAvailability.value = false;
  return true;
}

Future<void> _waitForUserChoice(dynamic deferredEvent) async {
  dynamic userChoice;
  try {
    userChoice = (deferredEvent as dynamic).userChoice;
  } catch (_) {
    return;
  }
  if (userChoice == null) {
    return;
  }

  final completer = Completer<void>();
  try {
    userChoice.then(
      (_) {
        if (!completer.isCompleted) {
          completer.complete();
        }
      },
      (_) {
        if (!completer.isCompleted) {
          completer.complete();
        }
      },
    );
    await completer.future.timeout(
      const Duration(seconds: 5),
      onTimeout: () {},
    );
  } catch (_) {}
}

Future<bool> _showAppleInstallDialog() async {
  final element = html.document.querySelector('pwa-install');
  if (element == null) {
    html.window.console.warn('pwa-install element not found');
    return false;
  }

  try {
    (element as dynamic).showDialog();
    return true;
  } catch (_) {
    html.window.console.warn('pwa-install showDialog not available');
    return false;
  }
}

bool get _isStandalone {
  if (_isIosDevice) {
    try {
      final standalone = (html.window.navigator as dynamic).standalone;
      if (standalone == true) {
        return true;
      }
    } catch (_) {
      // Continue with display-mode checks below.
    }
  }

  if (html.window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  if (html.window.matchMedia('(display-mode: fullscreen)').matches) {
    return true;
  }
  if (html.window.matchMedia('(display-mode: minimal-ui)').matches) {
    return true;
  }

  try {
    final standalone = (html.window.navigator as dynamic).standalone;
    return standalone == true;
  } catch (_) {
    return false;
  }
}

bool get _isIosDevice {
  final userAgent = html.window.navigator.userAgent.toLowerCase();
  if (userAgent.contains('iphone') ||
      userAgent.contains('ipad') ||
      userAgent.contains('ipod')) {
    return true;
  }

  final platform = html.window.navigator.platform?.toLowerCase();
  if (platform != null && platform.contains('mac')) {
    try {
      final maxTouchPoints = (html.window.navigator as dynamic).maxTouchPoints;
      if (maxTouchPoints is num && maxTouchPoints > 1) {
        return true;
      }
    } catch (_) {}
  }

  return false;
}

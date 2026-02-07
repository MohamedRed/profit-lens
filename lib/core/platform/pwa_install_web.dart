import 'dart:async';
import 'dart:html' as html;
import 'dart:js_util' as js_util;

import 'package:flutter/foundation.dart';

bool _listenerRegistered = false;
dynamic _deferredPromptEvent;

final ValueNotifier<bool> _pwaInstallAvailability = ValueNotifier(false);

ValueListenable<bool> get pwaInstallAvailability {
  _ensureBeforeInstallPromptListener();
  final deferredEvent = _getDeferredPromptEvent();
  if (!_isStandalone && deferredEvent != null && !_pwaInstallAvailability.value) {
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
    final jsEvent = event as dynamic;
    if (js_util.hasProperty(jsEvent, 'preventDefault')) {
      js_util.callMethod(jsEvent, 'preventDefault', const []);
    }
    _deferredPromptEvent = jsEvent;
    js_util.setProperty(html.window, 'defferedPromptEvent', jsEvent);
    _pwaInstallAvailability.value = !_isStandalone;
  });
  html.window.addEventListener('appinstalled', (_) {
    _deferredPromptEvent = null;
    js_util.setProperty(html.window, 'defferedPromptEvent', null);
    _pwaInstallAvailability.value = false;
  });
}

dynamic _getDeferredPromptEvent() {
  if (_deferredPromptEvent != null) {
    return _deferredPromptEvent;
  }
  if (js_util.hasProperty(html.window, 'defferedPromptEvent')) {
    final event = js_util.getProperty(html.window, 'defferedPromptEvent');
    if (event != null) {
      _deferredPromptEvent = event;
    }
  }
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
  if (js_util.hasProperty(deferredEvent, 'prompt')) {
    js_util.callMethod(deferredEvent, 'prompt', const []);
    if (js_util.hasProperty(deferredEvent, 'userChoice')) {
      try {
        await js_util.promiseToFuture(
          js_util.getProperty(deferredEvent, 'userChoice'),
        );
      } catch (_) {}
    }
  }
  _deferredPromptEvent = null;
  js_util.setProperty(html.window, 'defferedPromptEvent', null);
  _pwaInstallAvailability.value = false;
  return true;
}

Future<bool> _showAppleInstallDialog() async {
  final customElements = js_util.getProperty(html.window, 'customElements');
  if (customElements != null &&
      js_util.hasProperty(customElements, 'whenDefined')) {
    await js_util.promiseToFuture(
      js_util.callMethod(customElements, 'whenDefined', ['pwa-install']),
    );
  }
  final element = html.document.querySelector('pwa-install');
  if (element == null) {
    html.window.console.warn('pwa-install element not found');
    return false;
  }
  if (js_util.hasProperty(element, 'showDialog')) {
    js_util.callMethod(element, 'showDialog', const []);
    return true;
  }
  html.window.console.warn('pwa-install showDialog not available');
  return false;
}

bool get _isStandalone {
  if (_isIosDevice) {
    if (js_util.hasProperty(html.window.navigator, 'standalone')) {
      return js_util.getProperty(html.window.navigator, 'standalone') == true;
    }
    return false;
  }
  final mediaQuery =
      html.window.matchMedia('(display-mode: standalone)').matches;
  if (mediaQuery) {
    return true;
  }
  if (js_util.hasProperty(html.window.navigator, 'standalone')) {
    return js_util.getProperty(html.window.navigator, 'standalone') == true;
  }
  return false;
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
    final maxTouchPoints =
        js_util.getProperty(html.window.navigator, 'maxTouchPoints');
    if (maxTouchPoints is num && maxTouchPoints > 1) {
      return true;
    }
  }
  return false;
}

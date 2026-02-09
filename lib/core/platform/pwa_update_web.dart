import 'dart:html' as html;

import 'package:flutter/foundation.dart';

final ValueNotifier<bool> _pwaUpdateAvailability = ValueNotifier(false);
bool _listenerRegistered = false;
html.ServiceWorkerRegistration? _registration;

ValueListenable<bool> get pwaUpdateAvailability {
  _ensureUpdateListener();
  return _pwaUpdateAvailability;
}

Future<void> applyPwaUpdate() async {
  final container = html.window.navigator.serviceWorker;
  if (container == null) {
    return;
  }
  final registration = _registration ?? await container.ready;
  final waiting = registration.waiting;
  if (waiting != null) {
    waiting.postMessage('skipWaiting');
    _pwaUpdateAvailability.value = false;
  }
}

void _ensureUpdateListener() {
  if (_listenerRegistered) {
    return;
  }
  _listenerRegistered = true;
  final container = html.window.navigator.serviceWorker;
  if (container == null) {
    return;
  }
  container.ready.then((registration) {
    _registration = registration;
    _checkForWaiting(registration);
    registration.update();
    registration.addEventListener('updatefound', (_) {
      final installing = registration.installing;
      if (installing != null) {
        _listenForState(installing);
      }
    });
  });
  container.addEventListener('controllerchange', (_) {
    _pwaUpdateAvailability.value = false;
  });
}

void _checkForWaiting(html.ServiceWorkerRegistration registration) {
  if (registration.waiting != null &&
      html.window.navigator.serviceWorker?.controller != null) {
    _pwaUpdateAvailability.value = true;
  }
  final installing = registration.installing;
  if (installing != null) {
    _listenForState(installing);
  }
}

void _listenForState(html.ServiceWorker worker) {
  worker.addEventListener('statechange', (_) {
    if (worker.state == 'installed' &&
        html.window.navigator.serviceWorker?.controller != null) {
      _pwaUpdateAvailability.value = true;
    }
  });

  if (worker.state == 'installed' &&
      html.window.navigator.serviceWorker?.controller != null) {
    _pwaUpdateAvailability.value = true;
  }
}

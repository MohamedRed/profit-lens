import 'dart:html' as html;
import 'dart:js_util' as js_util;

bool _listenerRegistered = false;
dynamic _deferredPromptEvent;

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
  return _getDeferredPromptEvent() != null;
}

Future<void> showPwaInstallDialog() async {
  _ensureBeforeInstallPromptListener();
  final deferredEvent = _getDeferredPromptEvent();
  if (deferredEvent == null) {
    html.window.console.warn('beforeinstallprompt not available');
    return;
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
}

bool get _isStandalone {
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

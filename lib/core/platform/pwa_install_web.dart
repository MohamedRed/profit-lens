import 'dart:html' as html;
import 'dart:js_util' as js_util;

bool _listenerRegistered = false;
dynamic _deferredPromptEvent;

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

html.Element _refreshPwaInstallElement(html.Element element) {
  final parent = element.parent;
  if (parent == null) {
    return element;
  }
  final replacement = html.document.createElement('pwa-install');
  element.attributes.forEach((key, value) {
    replacement.setAttribute(key, value);
  });
  parent.insertBefore(replacement, element);
  element.remove();
  return replacement;
}

bool get isPwaInstallAvailable {
  _ensureBeforeInstallPromptListener();
  if (_isStandalone) {
    return false;
  }
  if (html.document.querySelector('pwa-install') == null) {
    return false;
  }
  final hasBeforeInstallPrompt =
      js_util.hasProperty(html.window, 'BeforeInstallPromptEvent');
  if (hasBeforeInstallPrompt) {
    return _getDeferredPromptEvent() != null;
  }
  return true;
}

Future<void> showPwaInstallDialog() async {
  _ensureBeforeInstallPromptListener();
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
    return;
  }
  final hasBeforeInstallPrompt =
      js_util.hasProperty(html.window, 'BeforeInstallPromptEvent');
  if (hasBeforeInstallPrompt && _getDeferredPromptEvent() == null) {
    html.window.console.warn('pwa-install prompt is not available yet');
    return;
  }
  final refreshedElement = _refreshPwaInstallElement(element);
  final deferredEvent = _getDeferredPromptEvent();
  if (deferredEvent != null) {
    js_util.setProperty(refreshedElement, 'externalPromptEvent', deferredEvent);
    js_util.setProperty(html.window, 'defferedPromptEvent', deferredEvent);
  }
  if (js_util.hasProperty(refreshedElement, 'showDialog')) {
    js_util.callMethod(refreshedElement, 'showDialog', const []);
    return;
  }
  html.window.console.warn('pwa-install showDialog not available');
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

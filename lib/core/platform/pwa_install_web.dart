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

bool get isPwaInstallAvailable {
  _ensureBeforeInstallPromptListener();
  if (_isStandalone) {
    return false;
  }
  return html.document.querySelector('pwa-install') != null;
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
  if (_deferredPromptEvent != null) {
    js_util.setProperty(html.window, 'defferedPromptEvent', _deferredPromptEvent);
  }
  if (js_util.hasProperty(element, 'showDialog')) {
    js_util.callMethod(element, 'showDialog', const []);
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

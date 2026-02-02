import 'dart:html' as html;
import 'dart:js_util' as js_util;

bool get isPwaInstallAvailable {
  if (_isStandalone) {
    return false;
  }
  return html.document.querySelector('pwa-install') != null;
}

Future<void> showPwaInstallDialog() async {
  final element = html.document.querySelector('pwa-install');
  if (element == null) {
    return;
  }
  final customElements = js_util.getProperty(html.window, 'customElements');
  if (customElements != null &&
      js_util.hasProperty(customElements, 'whenDefined')) {
    await js_util.promiseToFuture(
      js_util.callMethod(customElements, 'whenDefined', ['pwa-install']),
    );
  }
  if (js_util.hasProperty(element, 'showDialog')) {
    js_util.callMethod(element, 'showDialog', [true]);
    return;
  }
  await Future<void>.delayed(const Duration(milliseconds: 50));
  if (js_util.hasProperty(element, 'showDialog')) {
    js_util.callMethod(element, 'showDialog', [true]);
  }
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

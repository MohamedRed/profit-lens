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

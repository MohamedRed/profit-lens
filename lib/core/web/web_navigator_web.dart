// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

bool openExternalUrl(String url) {
  return html.window.open(url, '_blank') != null;
}

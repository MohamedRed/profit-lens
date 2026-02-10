// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

void navigateToUrl(String url) {
  html.window.location.assign(url);
}

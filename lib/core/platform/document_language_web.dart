import 'dart:html' as html;

void setDocumentLanguage(String languageCode) {
  if (languageCode.isEmpty) {
    return;
  }
  html.document.documentElement?.setAttribute('lang', languageCode);
}

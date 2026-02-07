import 'package:flutter/material.dart';

import '../platform/document_language.dart';

class AppLocaleController extends ChangeNotifier {
  Locale _locale = const Locale('fr');

  Locale get locale => _locale;

  void setLocale(Locale locale) {
    if (_locale == locale) {
      return;
    }
    _locale = locale;
    setDocumentLanguage(locale.languageCode);
    notifyListeners();
  }

  void setLocaleCode(String code) {
    setLocale(Locale(code));
  }
}

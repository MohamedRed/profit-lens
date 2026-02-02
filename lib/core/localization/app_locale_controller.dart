import 'package:flutter/material.dart';

class AppLocaleController extends ChangeNotifier {
  Locale _locale = const Locale('fr');

  Locale get locale => _locale;

  void setLocale(Locale locale) {
    if (_locale == locale) {
      return;
    }
    _locale = locale;
    notifyListeners();
  }

  void setLocaleCode(String code) {
    setLocale(Locale(code));
  }
}

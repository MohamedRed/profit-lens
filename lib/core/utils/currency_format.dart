import 'package:intl/intl.dart';

class CurrencyFormat {
  static String euro(double value, String localeTag) {
    final formatter = NumberFormat.simpleCurrency(locale: localeTag, name: 'EUR');
    return formatter.format(value);
  }
}

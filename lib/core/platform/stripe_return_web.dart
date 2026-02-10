// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

bool stripeReturnParamPresent() {
  final uri = Uri.parse(html.window.location.href);
  return uri.queryParameters['stripe_return'] == '1';
}

void clearStripeReturnParam() {
  final uri = Uri.parse(html.window.location.href);
  if (!uri.queryParameters.containsKey('stripe_return')) {
    return;
  }
  final nextParams = Map<String, String>.from(uri.queryParameters)
    ..remove('stripe_return');
  final nextUri = uri.replace(
    queryParameters: nextParams.isEmpty ? null : nextParams,
  );
  html.window.history.replaceState(null, '', nextUri.toString());
}

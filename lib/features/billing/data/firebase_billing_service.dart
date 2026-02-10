import 'package:cloud_functions/cloud_functions.dart';
import 'package:flutter/foundation.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/firebase_regions.dart';
import '../../../core/web/web_navigator.dart' as web_navigator;
import 'billing_service.dart';

class FirebaseBillingService implements BillingService {
  final FirebaseFunctions _functions;

  FirebaseBillingService({FirebaseFunctions? functions})
    : _functions =
          functions ??
          FirebaseFunctions.instanceFor(region: firebaseFunctionsRegion);

  @override
  Future<void> startCheckout(String priceId) async {
    if (priceId.isEmpty) {
      throw StateError('Stripe price ID not configured.');
    }
    final callable = _functions.httpsCallable('createCheckoutSession');
    final origin = Uri.base.origin;
    final response = await callable.call({
      'priceId': priceId,
      'origin': origin,
    });
    final data = Map<String, dynamic>.from(response.data as Map);
    final url = data['url'] as String?;
    if (url == null || url.isEmpty) {
      throw StateError('Missing checkout URL.');
    }
    await _launch(url);
  }

  @override
  Future<void> openCustomerPortal() async {
    final callable = _functions.httpsCallable('createCustomerPortalSession');
    final origin = Uri.base.origin;
    final response = await callable.call({'origin': origin});
    final data = Map<String, dynamic>.from(response.data as Map);
    final url = data['url'] as String?;
    if (url == null || url.isEmpty) {
      throw StateError('Missing portal URL.');
    }
    await _launch(url);
  }

  Future<void> _launch(String url) async {
    final uri = Uri.parse(url);
    if (kIsWeb) {
      web_navigator.navigateToUrl(url);
      return;
    }
    if (!await canLaunchUrl(uri)) {
      throw StateError('Could not launch $url');
    }
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

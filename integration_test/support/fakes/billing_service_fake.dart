import 'package:profit_lens/features/billing/data/billing_service.dart';

class NoopBillingService implements BillingService {
  const NoopBillingService();

  @override
  Future<void> openCustomerPortal() async {}

  @override
  Future<void> startCheckout(String priceId) async {}
}

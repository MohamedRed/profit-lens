abstract class BillingService {
  Future<void> startCheckout(String priceId);
  Future<void> openCustomerPortal();
}

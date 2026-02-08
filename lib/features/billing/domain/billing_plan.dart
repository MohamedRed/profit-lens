import '../../../core/config/app_config.dart';

class BillingPlan {
  final String id;
  final String priceId;
  final String priceLabel;
  final int? offerLimit;

  const BillingPlan({
    required this.id,
    required this.priceId,
    required this.priceLabel,
    required this.offerLimit,
  });

  bool get isUnlimited => offerLimit == null;
}

class BillingPlans {
  static final List<BillingPlan> all = [
    BillingPlan(
      id: 'tier_9',
      priceId: AppConfig.stripePriceTier9,
      priceLabel: '€9.99',
      offerLimit: 250,
    ),
    BillingPlan(
      id: 'tier_24',
      priceId: AppConfig.stripePriceTier24,
      priceLabel: '€24.99',
      offerLimit: 1000,
    ),
    BillingPlan(
      id: 'tier_34',
      priceId: AppConfig.stripePriceTier34,
      priceLabel: '€34.99',
      offerLimit: null,
    ),
  ];
}

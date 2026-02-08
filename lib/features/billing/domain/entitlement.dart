class Entitlement {
  final String planId;
  final String status;
  final int? offerLimit;
  final int deviceLimit;
  final DateTime periodStart;
  final DateTime periodEnd;
  final String periodKey;
  final String source;
  final String? stripeCustomerId;
  final String? stripeSubscriptionId;
  final String? stripePriceId;

  const Entitlement({
    required this.planId,
    required this.status,
    required this.offerLimit,
    required this.deviceLimit,
    required this.periodStart,
    required this.periodEnd,
    required this.periodKey,
    required this.source,
    required this.stripeCustomerId,
    required this.stripeSubscriptionId,
    required this.stripePriceId,
  });

  bool get isUnlimited => offerLimit == null;
  bool get isFree => planId == 'free';
}

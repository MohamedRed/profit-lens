import 'package:flutter/material.dart';

import '../../../../app/app_scope.dart';
import '../../../../core/config/app_config.dart';
import '../../../../core/widgets/primary_button.dart';
import '../../../billing/domain/entitlement.dart';
import '../../../billing/domain/offer_usage.dart';

class OfferLimitImportButton extends StatelessWidget {
  final String userId;
  final Key? buttonKey;
  final String label;
  final IconData icon;
  final bool isBusy;
  final VoidCallback onPressed;

  const OfferLimitImportButton({
    super.key,
    required this.userId,
    required this.label,
    required this.icon,
    required this.isBusy,
    required this.onPressed,
    this.buttonKey,
  });

  @override
  Widget build(BuildContext context) {
    if (!AppConfig.firebaseConfigured) {
      return _buildButton(canSubmit: !isBusy);
    }
    final services = AppScope.of(context);
    return StreamBuilder<Entitlement?>(
      stream: services.entitlementRepository.watchEntitlement(userId),
      builder: (context, entitlementSnapshot) {
        final isEntitlementLoading =
            entitlementSnapshot.connectionState == ConnectionState.waiting &&
                !entitlementSnapshot.hasData;
        final entitlement = entitlementSnapshot.data;
        if (entitlement == null || entitlement.offerLimit == null) {
          return _buildButton(
            canSubmit: !isBusy && !isEntitlementLoading,
            isLoading: isEntitlementLoading,
          );
        }
        return StreamBuilder<OfferUsage?>(
          stream: services.usageRepository.watchUsage(
            userId,
            entitlement.periodKey,
          ),
          builder: (context, usageSnapshot) {
            final isUsageLoading =
                usageSnapshot.connectionState == ConnectionState.waiting &&
                    !usageSnapshot.hasData;
            final usage = usageSnapshot.data;
            final used = usage?.offerCount ?? 0;
            final limitReached = used >= entitlement.offerLimit!;
            return _buildButton(
              canSubmit: !isBusy && !limitReached && !isUsageLoading,
              isLoading: isUsageLoading,
            );
          },
        );
      },
    );
  }

  Widget _buildButton({required bool canSubmit, bool isLoading = false}) {
    return PrimaryButton(
      key: buttonKey,
      label: label,
      icon: icon,
      onPressed: canSubmit ? onPressed : null,
      isBusy: isLoading && !isBusy,
      showSpinnerWithLabel: isLoading,
    );
  }
}

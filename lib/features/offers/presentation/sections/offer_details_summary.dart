import 'package:flutter/material.dart';

import '../../../../core/widgets/section_card.dart';
import '../../../../l10n/app_localizations.dart';
import '../controllers/offer_flow_controller.dart';

class OfferDetailsSummary extends StatelessWidget {
  final OfferFlowController controller;
  final VoidCallback onEdit;

  const OfferDetailsSummary({
    super.key,
    required this.controller,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final payout = controller.payoutController.text.trim();
    final distance = controller.distanceController.text.trim();
    final duration = controller.durationController.text.trim();
    final pickupName = controller.pickupNameController.text.trim();
    final pickupAddress = controller.pickupAddressController.text.trim();
    final dropoffName = controller.dropoffNameController.text.trim();
    final dropoffAddress = controller.dropoffAddressController.text.trim();
    final verification = controller.routeVerification;
    return SectionCard(
      title: l10n.offerDetailsSection,
      children: [
        if (payout.isNotEmpty)
          Text('${l10n.offerAmountLabel}: €$payout'),
        if (verification == null && distance.isNotEmpty)
          Text('${l10n.distanceKmLabel}: $distance'),
        if (verification == null && duration.isNotEmpty)
          Text('${l10n.durationMinutesLabel}: $duration'),
        if (verification != null)
          Text(
            '${l10n.verifiedDistanceLabel}: ${verification.distanceKm.toStringAsFixed(1)}',
          ),
        if (verification != null)
          Text(
            '${l10n.verifiedDurationLabel}: ${verification.durationMinutes.toStringAsFixed(0)}',
          ),
        if (pickupName.isNotEmpty)
          Text('${l10n.pickupNameLabel}: $pickupName'),
        if (pickupAddress.isNotEmpty)
          Text('${l10n.pickupAddressLabel}: $pickupAddress'),
        if (dropoffName.isNotEmpty)
          Text('${l10n.dropoffNameLabel}: $dropoffName'),
        if (dropoffAddress.isNotEmpty)
          Text('${l10n.dropoffAddressLabel}: $dropoffAddress'),
        const SizedBox(height: 8),
        TextButton(onPressed: onEdit, child: Text(l10n.editOfferDetailsButton)),
      ],
    );
  }
}

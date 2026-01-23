import 'package:flutter/material.dart';

import '../../../app/app_scope.dart';
import '../../../core/widgets/primary_button.dart';
import '../../../features/auth/domain/auth_user.dart';
import '../../../l10n/app_localizations.dart';
import '../domain/offer_record.dart';
import 'widgets/offer_breakdown_card.dart';

class OfferResultScreen extends StatelessWidget {
  final AuthUser user;
  final OfferRecord record;

  const OfferResultScreen({
    super.key,
    required this.user,
    required this.record,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text(l10n.resultTitle)),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            OfferBreakdownCard(record: record),
            const SizedBox(height: 16),
            PrimaryButton(
              label: l10n.saveOfferButton,
              onPressed: () => _saveOffer(context),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _saveOffer(BuildContext context) async {
    final services = AppScope.of(context);
    final l10n = AppLocalizations.of(context)!;
    try {
      await services.offerRepository.saveOffer(user.uid, record);
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.offerSavedMessage)),
        );
        Navigator.of(context).pop();
      }
    } catch (error) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.offerSaveFailedMessage)),
        );
      }
    }
  }
}

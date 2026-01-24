import 'package:flutter/material.dart';

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
          ],
        ),
      ),
    );
  }
}

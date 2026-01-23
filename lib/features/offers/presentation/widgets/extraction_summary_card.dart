import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/offer_extraction_metadata.dart';

class ExtractionSummaryCard extends StatelessWidget {
  final OfferExtractionMetadata metadata;

  const ExtractionSummaryCard({super.key, required this.metadata});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.extractionSummaryTitle,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text('${l10n.confidenceLabel}: ${metadata.confidence.toStringAsFixed(2)}'),
            if (metadata.rawText != null && metadata.rawText!.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(metadata.rawText!, maxLines: 6, overflow: TextOverflow.ellipsis),
            ],
          ],
        ),
      ),
    );
  }
}

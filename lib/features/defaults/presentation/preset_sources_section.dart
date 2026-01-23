import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/widgets/section_card.dart';
import '../../../l10n/app_localizations.dart';
import '../data/france_defaults.dart';

class PresetSourcesSection extends StatelessWidget {
  final List<DefaultSource> sources;

  const PresetSourcesSection({
    super.key,
    required this.sources,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.sourcesSection,
      children: sources
          .map(
            (source) => ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(source.label),
              subtitle: Text(
                '${l10n.sourceLastCheckedLabel}: ${source.lastChecked}',
              ),
              trailing: TextButton(
                onPressed: () => _openSource(context, source.url),
                child: Text(l10n.sourceOpenButton),
              ),
            ),
          )
          .toList(),
    );
  }

  Future<void> _openSource(BuildContext context, String url) async {
    final l10n = AppLocalizations.of(context)!;
    final uri = Uri.parse(url);
    final launched = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    );
    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(l10n.sourceOpenError)),
      );
    }
  }
}

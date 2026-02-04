import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/widgets/section_card.dart';
import '../../../l10n/app_localizations.dart';
import '../data/france_defaults.dart';

class PresetSourcesSection extends StatefulWidget {
  final List<DefaultSource> sources;

  const PresetSourcesSection({
    super.key,
    required this.sources,
  });

  @override
  State<PresetSourcesSection> createState() => _PresetSourcesSectionState();
}

class _PresetSourcesSectionState extends State<PresetSourcesSection> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return SectionCard(
      title: l10n.sourcesSection,
      trailing: IconButton(
        icon: Icon(_expanded ? Icons.expand_less : Icons.expand_more),
        onPressed: () => setState(() => _expanded = !_expanded),
      ),
      hasBody: _expanded,
      children: _expanded
          ? widget.sources
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
              .toList()
          : const [],
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

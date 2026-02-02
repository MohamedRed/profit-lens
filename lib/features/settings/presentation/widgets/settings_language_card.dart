import 'package:flutter/material.dart';

import '../../../../app/app_scope.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/domain/auth_user.dart';
import '../../../profile/domain/user_profile.dart';

class SettingsLanguageCard extends StatefulWidget {
  final AuthUser user;
  final UserProfile profile;

  const SettingsLanguageCard({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  State<SettingsLanguageCard> createState() => _SettingsLanguageCardState();
}

class _SettingsLanguageCardState extends State<SettingsLanguageCard> {
  static const _supported = ['fr', 'en', 'ar'];

  late String _selected;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _selected = widget.profile.preferredLocale ?? 'fr';
  }

  @override
  void didUpdateWidget(covariant SettingsLanguageCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    final next = widget.profile.preferredLocale ?? 'fr';
    if (next != _selected) {
      _selected = next;
    }
  }

  String _labelFor(String code, AppLocalizations l10n) {
    switch (code) {
      case 'fr':
        return l10n.languageFrench;
      case 'en':
        return l10n.languageEnglish;
      case 'ar':
        return l10n.languageArabic;
      default:
        return code;
    }
  }

  Future<void> _applySelection(String? value) async {
    if (value == null || value == _selected) {
      return;
    }
    final l10n = AppLocalizations.of(context)!;
    final services = AppScope.of(context);
    final previous = _selected;
    setState(() {
      _selected = value;
      _isSaving = true;
    });
    services.localeController.setLocaleCode(value);
    try {
      final updated = widget.profile.copyWith(preferredLocale: value);
      await services.userProfileRepository.saveProfile(updated);
    } catch (_) {
      services.localeController.setLocaleCode(previous);
      if (mounted) {
        setState(() {
          _selected = previous;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(l10n.profileSaveFailedMessage)),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSaving = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              l10n.languageSectionTitle,
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              value: _selected,
              items: _supported
                  .map(
                    (code) => DropdownMenuItem(
                      value: code,
                      child: Text(_labelFor(code, l10n)),
                    ),
                  )
                  .toList(),
              onChanged: _isSaving ? null : _applySelection,
            ),
          ],
        ),
      ),
    );
  }
}

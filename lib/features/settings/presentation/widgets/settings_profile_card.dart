import 'package:flutter/material.dart';

import '../../../../core/utils/currency_format.dart';
import '../../../../l10n/app_localizations.dart';
import '../../../auth/domain/auth_user.dart';
import '../../../profile/domain/user_profile.dart';
import '../../../profile/presentation/profile_edit_screen.dart';

class SettingsProfileCard extends StatelessWidget {
  final AuthUser user;
  final UserProfile profile;

  const SettingsProfileCard({
    super.key,
    required this.user,
    required this.profile,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final localeTag = Localizations.localeOf(context).toString();
    return ListTile(
      title: Text(l10n.profileSectionTitle),
      subtitle: Text(
        '${l10n.socialRateLabel}: ${(profile.socialContributionRate * 100).toStringAsFixed(1)}%\n'
        '${l10n.monthlyFixedCostsLabel}: ${CurrencyFormat.euro(profile.monthlyFixedCosts, localeTag)}',
      ),
      trailing: const Icon(Icons.chevron_right),
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) =>
                ProfileEditScreen(user: user, profile: profile),
          ),
        );
      },
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../l10n/app_localizations.dart';
import '../../domain/business_activity.dart';

class BusinessActivityField extends StatelessWidget {
  final BusinessActivity value;
  final ValueChanged<BusinessActivity> onChanged;

  const BusinessActivityField({
    super.key,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return DropdownButtonFormField<BusinessActivity>(
      initialValue: value,
      decoration: InputDecoration(labelText: l10n.activityLabel),
      items: BusinessActivity.values
          .map(
            (activity) => DropdownMenuItem(
              value: activity,
              child: Text(_activityLabel(l10n, activity)),
            ),
          )
          .toList(),
      onChanged: (value) {
        if (value != null) {
          onChanged(value);
        }
      },
    );
  }

  String _activityLabel(AppLocalizations l10n, BusinessActivity activity) {
    switch (activity) {
      case BusinessActivity.deliveryServices:
        return l10n.activityDelivery;
      case BusinessActivity.services:
        return l10n.activityServices;
      case BusinessActivity.sales:
        return l10n.activitySales;
    }
  }
}

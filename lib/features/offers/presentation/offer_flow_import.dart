import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../../app/app_scope.dart';
import '../../../l10n/app_localizations.dart';
import 'controllers/offer_flow_controller.dart';

Future<void> importOfferScreenshot({
  required BuildContext context,
  required ImageSource source,
  required ImagePicker picker,
  required OfferFlowController controller,
  required ValueChanged<bool> onLoadingChanged,
  required VoidCallback onUpdated,
}) async {
  final image = await picker.pickImage(source: source);
  if (image == null) {
    return;
  }
  if (!context.mounted) {
    return;
  }
  final l10n = AppLocalizations.of(context)!;
  onLoadingChanged(true);
  try {
    final result = await AppScope.of(context)
        .offerIngestionService
        .extractFromImage(image);
    if (!context.mounted) {
      return;
    }
    controller.applyExtraction(result);
    onUpdated();
  } catch (_) {
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(l10n.extractionFailedMessage)),
    );
  } finally {
    if (context.mounted) {
      onLoadingChanged(false);
    }
  }
}

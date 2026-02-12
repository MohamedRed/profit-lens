import 'package:flutter/material.dart';

import '../../../../core/widgets/primary_button.dart';

class OfferLimitImportButton extends StatelessWidget {
  final Key? buttonKey;
  final String label;
  final IconData icon;
  final bool isBusy;
  final VoidCallback onPressed;

  const OfferLimitImportButton({
    super.key,
    required this.label,
    required this.icon,
    required this.isBusy,
    required this.onPressed,
    this.buttonKey,
  });

  @override
  Widget build(BuildContext context) {
    return _buildButton(canSubmit: !isBusy);
  }

  Widget _buildButton({required bool canSubmit}) {
    return PrimaryButton(
      key: buttonKey,
      label: label,
      icon: icon,
      onPressed: canSubmit ? onPressed : null,
    );
  }
}

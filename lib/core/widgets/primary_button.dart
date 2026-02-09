import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool isBusy;
  final bool showSpinnerWithLabel;

  const PrimaryButton({
    super.key,
    required this.label,
    this.icon,
    required this.onPressed,
    this.isBusy = false,
    this.showSpinnerWithLabel = false,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: FilledButton(
        onPressed: isBusy ? null : onPressed,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: isBusy
              ? _BusyContent(
                  label: label,
                  showSpinnerWithLabel: showSpinnerWithLabel,
                )
              : _ButtonContent(label: label, icon: icon),
        ),
      ),
    );
  }
}

class _ButtonContent extends StatelessWidget {
  final String label;
  final IconData? icon;

  const _ButtonContent({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    if (icon == null) {
      return Text(label);
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [Icon(icon, size: 18), const SizedBox(width: 8), Text(label)],
    );
  }
}

class _BusyContent extends StatelessWidget {
  final String label;
  final bool showSpinnerWithLabel;

  const _BusyContent({required this.label, required this.showSpinnerWithLabel});

  @override
  Widget build(BuildContext context) {
    final disabledColor = Theme.of(context).disabledColor;
    final spinner = SizedBox(
      height: 16,
      width: 16,
      child: CircularProgressIndicator(
        strokeWidth: 2,
        valueColor: AlwaysStoppedAnimation(disabledColor),
      ),
    );
    if (!showSpinnerWithLabel) {
      return spinner;
    }
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        spinner,
        const SizedBox(width: 8),
        Text(label, style: TextStyle(color: disabledColor)),
      ],
    );
  }
}

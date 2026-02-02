import 'package:flutter/material.dart';

class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isBusy;
  final bool showSpinnerWithLabel;

  const PrimaryButton({
    super.key,
    required this.label,
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
              ? (showSpinnerWithLabel
                  ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        const SizedBox(width: 8),
                        Text(label),
                      ],
                    )
                  : const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    ))
              : Text(label),
        ),
      ),
    );
  }
}

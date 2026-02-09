import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;
  final bool hasBody;
  final Color? backgroundColor;
  final Color? borderColor;

  const SectionCard({
    super.key,
    required this.title,
    required this.children,
    this.trailing,
    this.hasBody = true,
    this.backgroundColor,
    this.borderColor,
  });

  @override
  Widget build(BuildContext context) {
    final showBody = hasBody && children.isNotEmpty;
    return Container(
      decoration: BoxDecoration(
        color: backgroundColor ?? ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        border: borderColor == null ? null : Border.all(color: borderColor!),
      ),
      padding: const EdgeInsets.all(ShadcnSpacing.xxl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  title,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ),
              if (trailing != null) trailing!,
            ],
          ),
          if (showBody) ...[
            const SizedBox(height: ShadcnSpacing.lg),
            ...children,
          ],
        ],
      ),
    );
  }
}

import 'package:flutter/material.dart';

import '../../../../core/design_system/shadcn_tokens.dart';

class HelpSectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;
  final bool hasBody;

  const HelpSectionCard({
    super.key,
    required this.title,
    required this.children,
    this.trailing,
    this.hasBody = true,
  });

  @override
  Widget build(BuildContext context) {
    final showBody = hasBody && children.isNotEmpty;
    return Container(
      decoration: BoxDecoration(
        color: ShadcnColors.background,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
        border: Border.all(color: ShadcnColors.outline),
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

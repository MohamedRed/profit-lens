import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final Widget? trailing;
  final bool hasBody;
  final bool showSurface;
  final bool showBorder;
  const SectionCard({
    super.key,
    required this.title,
    required this.children,
    this.trailing,
    this.hasBody = true,
    this.showSurface = true,
    this.showBorder = false,
  });

  @override
  Widget build(BuildContext context) {
    final showBody = hasBody && children.isNotEmpty;
    final decoration = showSurface || showBorder
        ? BoxDecoration(
            color: showSurface ? ShadcnColors.surface : Colors.transparent,
            borderRadius: BorderRadius.circular(ShadcnRadius.xl),
            border: showBorder ? Border.all(color: ShadcnColors.outline) : null,
          )
        : null;
    return Container(
      decoration: decoration,
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

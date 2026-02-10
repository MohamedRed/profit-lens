import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';

class MobilePillNavItem {
  final IconData icon;
  final String label;

  const MobilePillNavItem({required this.icon, required this.label});
}

class MobilePillNav extends StatelessWidget {
  final List<MobilePillNavItem> items;
  final int currentIndex;
  final ValueChanged<int> onChanged;

  const MobilePillNav({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    assert(items.isNotEmpty, 'MobilePillNav requires at least one item.');
    assert(
      currentIndex >= 0 && currentIndex < items.length,
      'MobilePillNav currentIndex must be within item range.',
    );
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: LayoutBuilder(
        builder: (context, constraints) {
          const baseHorizontalPadding = 12.0;
          const compactHorizontalPadding = 6.0;
          final baseItemWidth =
              (constraints.maxWidth - baseHorizontalPadding * 2) / items.length;
          final isCompact = baseItemWidth < 84;
          final horizontalPadding = isCompact
              ? compactHorizontalPadding
              : baseHorizontalPadding;
          final verticalPadding = isCompact ? 6.0 : 8.0;
          final height = isCompact ? 64.0 : 72.0;

          return Container(
            height: height,
            decoration: BoxDecoration(
              color: ShadcnColors.surface,
              borderRadius: BorderRadius.circular(ShadcnRadius.pill),
              boxShadow: const [
                BoxShadow(
                  color: Color(0x14000000),
                  blurRadius: 12,
                  offset: Offset(0, 6),
                ),
              ],
            ),
            padding: EdgeInsets.symmetric(
              horizontal: horizontalPadding,
              vertical: verticalPadding,
            ),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final indicatorWidth = constraints.maxWidth / items.length;
                return Stack(
                  children: [
                    AnimatedPositioned(
                      duration: ShadcnDurations.short,
                      curve: Curves.easeOut,
                      left: indicatorWidth * currentIndex,
                      top: 0,
                      bottom: 0,
                      child: Container(
                        width: indicatorWidth,
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(28),
                        ),
                      ),
                    ),
                    Row(
                      children: [
                        for (int i = 0; i < items.length; i++)
                          _NavButton(
                            item: items[i],
                            isActive: i == currentIndex,
                            isCompact: isCompact,
                            onTap: () => onChanged(i),
                          ),
                      ],
                    ),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final MobilePillNavItem item;
  final bool isActive;
  final bool isCompact;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.isActive,
    required this.isCompact,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? ShadcnColors.purple : ShadcnColors.textSecondary;
    final labelStyle = Theme.of(context).textTheme.labelMedium?.copyWith(
      color: color,
      fontSize: isCompact ? 10 : null,
      height: isCompact ? 1.1 : null,
    );
    final iconSize = isCompact ? 20.0 : 24.0;
    final horizontalPadding = isCompact ? 6.0 : 12.0;
    final spacing = isCompact ? 2.0 : 4.0;

    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, color: color, size: iconSize),
              SizedBox(height: spacing),
              if (isCompact)
                FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Text(
                    item.label,
                    maxLines: 1,
                    softWrap: false,
                    style: labelStyle,
                  ),
                )
              else
                Text(
                  item.label,
                  maxLines: 1,
                  softWrap: false,
                  style: labelStyle,
                ),
            ],
          ),
        ),
      ),
    );
  }
}

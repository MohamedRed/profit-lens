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
    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      child: Container(
        height: 72,
        decoration: BoxDecoration(
          color: ShadcnColors.surface,
          borderRadius: BorderRadius.circular(ShadcnRadius.pill),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
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
                        onTap: () => onChanged(i),
                      ),
                  ],
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _NavButton extends StatelessWidget {
  final MobilePillNavItem item;
  final bool isActive;
  final VoidCallback onTap;

  const _NavButton({
    required this.item,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = isActive ? ShadcnColors.purple : ShadcnColors.textSecondary;
    final labelStyle = Theme.of(context).textTheme.labelMedium?.copyWith(
          color: color,
        );

    return Expanded(
      child: InkWell(
        borderRadius: BorderRadius.circular(28),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(item.icon, color: color),
              const SizedBox(height: 4),
              Text(item.label, style: labelStyle),
            ],
          ),
        ),
      ),
    );
  }
}

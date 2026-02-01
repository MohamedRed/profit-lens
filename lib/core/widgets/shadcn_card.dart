import 'package:flutter/material.dart';

import '../design_system/shadcn_tokens.dart';

class ShadcnCard extends StatelessWidget {
  final Widget? title;
  final List<Widget> children;
  final EdgeInsetsGeometry padding;

  const ShadcnCard({
    super.key,
    this.title,
    this.children = const [],
    this.padding = const EdgeInsets.all(ShadcnSpacing.xxl),
  });

  @override
  Widget build(BuildContext context) {
    final body = <Widget>[];
    if (title != null) {
      body
        ..add(title!)
        ..add(const SizedBox(height: ShadcnSpacing.md));
    }
    body.addAll(children);

    return Container(
      decoration: BoxDecoration(
        color: ShadcnColors.surface,
        borderRadius: BorderRadius.circular(ShadcnRadius.xl),
      ),
      child: Padding(
        padding: padding,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: body,
        ),
      ),
    );
  }
}

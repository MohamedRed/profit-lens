import 'package:flutter/widgets.dart';

class LazyIndexedStack extends StatefulWidget {
  final int index;
  final List<WidgetBuilder> builders;
  final AlignmentGeometry alignment;
  final TextDirection? textDirection;
  final StackFit sizing;

  const LazyIndexedStack({
    super.key,
    required this.index,
    required this.builders,
    this.alignment = AlignmentDirectional.topStart,
    this.textDirection,
    this.sizing = StackFit.loose,
  });

  @override
  State<LazyIndexedStack> createState() => _LazyIndexedStackState();
}

class _LazyIndexedStackState extends State<LazyIndexedStack> {
  late final Set<int> _builtIndices = {widget.index};

  @override
  void didUpdateWidget(covariant LazyIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (_builtIndices.contains(widget.index)) {
      return;
    }
    _builtIndices.add(widget.index);
  }

  @override
  Widget build(BuildContext context) {
    return IndexedStack(
      index: widget.index,
      alignment: widget.alignment,
      textDirection: widget.textDirection,
      sizing: widget.sizing,
      children: List<Widget>.generate(widget.builders.length, (index) {
        if (!_builtIndices.contains(index)) {
          return const SizedBox.shrink();
        }
        return Builder(builder: widget.builders[index]);
      }),
    );
  }
}

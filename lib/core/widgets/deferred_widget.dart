import 'package:flutter/material.dart';

class DeferredWidget extends StatefulWidget {
  final Future<void> Function() loadLibrary;
  final Widget Function() builder;
  final Widget? loading;
  final WidgetBuilder? errorBuilder;

  const DeferredWidget({
    super.key,
    required this.loadLibrary,
    required this.builder,
    this.loading,
    this.errorBuilder,
  });

  @override
  State<DeferredWidget> createState() => _DeferredWidgetState();
}

class _DeferredWidgetState extends State<DeferredWidget> {
  late Future<void> _loadFuture;

  @override
  void initState() {
    super.initState();
    _loadFuture = widget.loadLibrary();
  }

  @override
  void didUpdateWidget(covariant DeferredWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.loadLibrary == widget.loadLibrary) {
      return;
    }
    _loadFuture = widget.loadLibrary();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _loadFuture,
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          if (widget.errorBuilder != null) {
            return widget.errorBuilder!(context);
          }
          return const Center(child: Text('Failed to load view.'));
        }
        if (snapshot.connectionState != ConnectionState.done) {
          return widget.loading ??
              const Center(child: CircularProgressIndicator());
        }
        return widget.builder();
      },
    );
  }
}

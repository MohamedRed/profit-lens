import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

/// iOS-style horizontal transitions without the edge-swipe back gesture.
///
/// Flutter's default iOS page transitions add a back-gesture detector.
/// For a PWA, that gesture can conflict with browser navigation.
class NoSwipeCupertinoPageTransitionsBuilder extends PageTransitionsBuilder {
  const NoSwipeCupertinoPageTransitionsBuilder();

  @override
  Duration get transitionDuration =>
      CupertinoRouteTransitionMixin.kTransitionDuration;

  @override
  DelegatedTransitionBuilder? get delegatedTransition =>
      CupertinoPageTransition.delegatedTransition;

  @override
  Widget buildTransitions<T>(
    PageRoute<T> route,
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    // There's no back-swipe gesture, but keeping this makes the transition
    // linear if the navigator reports a gesture in progress for any reason.
    final linearTransition = route.popGestureInProgress;

    if (route.fullscreenDialog) {
      return CupertinoFullscreenDialogTransition(
        primaryRouteAnimation: animation,
        secondaryRouteAnimation: secondaryAnimation,
        linearTransition: linearTransition,
        child: child,
      );
    }

    return CupertinoPageTransition(
      primaryRouteAnimation: animation,
      secondaryRouteAnimation: secondaryAnimation,
      linearTransition: linearTransition,
      child: child,
    );
  }
}


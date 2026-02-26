import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { useLaunchSplashWindow } from './launch-splash-window';

const SPLASH_EXIT_MS = 240;
const SPLASH_PROGRESS_SMOOTHING = 0.14;

const resolveProgressTarget = (
  elapsedMs: number,
  ready: boolean,
  windowReady: boolean,
  exiting: boolean,
): number => {
  if (exiting) {
    return 1;
  }

  const preAuthRamp = Math.min(elapsedMs / 900, 1);
  if (!ready) {
    return 0.08 + preAuthRamp * 0.68;
  }

  if (!windowReady) {
    const postAuthRamp = Math.min(elapsedMs / 320, 1);
    return 0.82 + postAuthRamp * 0.1;
  }

  return 0.96;
};

const resolveStatusText = (progress: number, ready: boolean, windowReady: boolean, exiting: boolean): string => {
  if (exiting) {
    return 'Launching Liive Profit...';
  }

  if (!ready) {
    if (progress < 0.34) {
      return 'Securing session...';
    }
    if (progress < 0.68) {
      return 'Syncing your workspace...';
    }
    return 'Preparing live insights...';
  }

  if (!windowReady) {
    return 'Finalizing launch...';
  }

  return 'Launching Liive Profit...';
};

export interface LaunchSplashTransition {
  canContinue: Signal<boolean>;
  exiting: Signal<boolean>;
  progress: Signal<number>;
  status: Signal<string>;
}

export const useLaunchSplashTransition = (ready: Signal<boolean>): LaunchSplashTransition => {
  const splashWindowElapsed = useLaunchSplashWindow();
  const canContinue = useSignal(false);
  const exiting = useSignal(false);
  const progress = useSignal(0.08);
  const status = useSignal('Securing session...');
  const splashMountedAt = useSignal<number>(0);

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => ready.value);
    const windowReady = track(() => splashWindowElapsed.value);
    const isExiting = track(() => exiting.value);
    const hasMounted = splashMountedAt.value > 0;

    if (!hasMounted) {
      splashMountedAt.value = performance.now();
    }

    let frameId = 0;

    const tick = () => {
      const base = splashMountedAt.value || performance.now();
      const elapsedMs = performance.now() - base;
      const target = resolveProgressTarget(elapsedMs, isReady, windowReady, isExiting);
      const delta = target - progress.value;
      if (Math.abs(delta) <= 0.001) {
        progress.value = Math.min(1, target);
        status.value = resolveStatusText(progress.value, isReady, windowReady, isExiting);
        return;
      }

      const next = progress.value + delta * SPLASH_PROGRESS_SMOOTHING;
      progress.value = Math.min(1, next);
      status.value = resolveStatusText(progress.value, isReady, windowReady, isExiting);

      if (progress.value < 0.999) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    cleanup(() => {
      window.cancelAnimationFrame(frameId);
    });
  });

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => ready.value);
    const windowReady = track(() => splashWindowElapsed.value);

    if (!isReady || !windowReady || canContinue.value || exiting.value) {
      return;
    }

    exiting.value = true;

    const timerId = window.setTimeout(() => {
      progress.value = 1;
      status.value = 'Launching Liive Profit...';
      canContinue.value = true;
    }, SPLASH_EXIT_MS);

    cleanup(() => {
      window.clearTimeout(timerId);
    });
  });

  return {
    canContinue,
    exiting,
    progress,
    status,
  };
};

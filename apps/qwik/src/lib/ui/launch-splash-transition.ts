import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { useLaunchSplashWindow } from './launch-splash-window';

const SPLASH_EXIT_MS = 320;

export interface LaunchSplashTransition {
  canContinue: Signal<boolean>;
  exiting: Signal<boolean>;
}

export const useLaunchSplashTransition = (ready: Signal<boolean>): LaunchSplashTransition => {
  const splashWindowElapsed = useLaunchSplashWindow();
  const canContinue = useSignal(false);
  const exiting = useSignal(false);

  useVisibleTask$(({ track, cleanup }) => {
    const isReady = track(() => ready.value);
    const windowReady = track(() => splashWindowElapsed.value);

    if (!isReady || !windowReady || canContinue.value || exiting.value) {
      return;
    }

    exiting.value = true;

    const timerId = window.setTimeout(() => {
      canContinue.value = true;
    }, SPLASH_EXIT_MS);

    cleanup(() => {
      window.clearTimeout(timerId);
    });
  });

  return {
    canContinue,
    exiting,
  };
};

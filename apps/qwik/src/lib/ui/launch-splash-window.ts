import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';

const MIN_SPLASH_WINDOW_MS = 1450;

let launchSplashStartAt: number | null = null;

const resolveRemainingSplashMs = (now: number): number => {
  if (launchSplashStartAt === null) {
    launchSplashStartAt = now;
  }
  const elapsed = now - launchSplashStartAt;
  return Math.max(0, MIN_SPLASH_WINDOW_MS - elapsed);
};

export const useLaunchSplashWindow = (): Signal<boolean> => {
  const hasElapsed = useSignal(false);

  useVisibleTask$(({ cleanup }) => {
    const remaining = resolveRemainingSplashMs(Date.now());
    if (remaining === 0) {
      hasElapsed.value = true;
      return;
    }

    const timerId = window.setTimeout(() => {
      hasElapsed.value = true;
    }, remaining);

    cleanup(() => {
      window.clearTimeout(timerId);
    });
  });

  return hasElapsed;
};

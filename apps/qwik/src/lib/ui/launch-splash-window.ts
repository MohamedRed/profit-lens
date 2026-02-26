import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';

const FIRST_LAUNCH_SPLASH_MS = 1180;
const REPEAT_LAUNCH_SPLASH_MS = 760;
const REDUCED_MOTION_SPLASH_MS = 520;
const SPLASH_SESSION_FLAG = 'pl-splash-session-seen';

let launchSplashStartAt: number | null = null;
let minSplashWindowMs: number | null = null;

const resolveMinSplashWindowMs = (): number => {
  if (minSplashWindowMs !== null) {
    return minSplashWindowMs;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    minSplashWindowMs = REDUCED_MOTION_SPLASH_MS;
    return minSplashWindowMs;
  }

  let hasSeenSplashInSession = false;

  try {
    hasSeenSplashInSession = window.sessionStorage.getItem(SPLASH_SESSION_FLAG) === '1';
    window.sessionStorage.setItem(SPLASH_SESSION_FLAG, '1');
  } catch {
    hasSeenSplashInSession = false;
  }

  minSplashWindowMs = hasSeenSplashInSession ? REPEAT_LAUNCH_SPLASH_MS : FIRST_LAUNCH_SPLASH_MS;
  return minSplashWindowMs;
};

const resolveRemainingSplashMs = (now: number): number => {
  if (launchSplashStartAt === null) {
    launchSplashStartAt = now;
  }
  const minimumWindowMs = resolveMinSplashWindowMs();
  const elapsed = now - launchSplashStartAt;
  return Math.max(0, minimumWindowMs - elapsed);
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

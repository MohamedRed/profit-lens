import { useSignal, useVisibleTask$, type Signal } from '@builder.io/qwik';
import { getLaunchSplashRuntimeState } from './launch-splash-runtime-state';

const FIRST_LAUNCH_SPLASH_MS = 1180;
const REPEAT_LAUNCH_SPLASH_MS = 760;
const REDUCED_MOTION_SPLASH_MS = 520;
const SPLASH_SESSION_FLAG = 'pl-splash-session-seen';

const resolveMinSplashWindowMs = (): number => {
  const runtimeState = getLaunchSplashRuntimeState();

  if (runtimeState.minimumWindowMs !== null) {
    return runtimeState.minimumWindowMs;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    runtimeState.minimumWindowMs = REDUCED_MOTION_SPLASH_MS;
    return runtimeState.minimumWindowMs;
  }

  let hasSeenSplashInSession = false;

  try {
    hasSeenSplashInSession = window.sessionStorage.getItem(SPLASH_SESSION_FLAG) === '1';
    window.sessionStorage.setItem(SPLASH_SESSION_FLAG, '1');
  } catch {
    hasSeenSplashInSession = false;
  }

  runtimeState.minimumWindowMs = hasSeenSplashInSession ? REPEAT_LAUNCH_SPLASH_MS : FIRST_LAUNCH_SPLASH_MS;
  return runtimeState.minimumWindowMs;
};

const resolveRemainingSplashMs = (now: number): number => {
  const runtimeState = getLaunchSplashRuntimeState();

  if (runtimeState.launchStartedAt === null) {
    runtimeState.launchStartedAt = now;
  }
  const minimumWindowMs = resolveMinSplashWindowMs();
  const elapsed = now - runtimeState.launchStartedAt;
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

export interface LaunchSplashRuntimeState {
  transitionCompleted: boolean;
  launchStartedAt: number | null;
  minimumWindowMs: number | null;
  launchEffectsConsumed: boolean;
}

const SPLASH_TRANSITION_COMPLETED_SESSION_KEY = 'pl-splash-transition-completed';

type SplashRuntimeGlobal = typeof globalThis & {
  __profitLensLaunchSplashRuntimeState?: LaunchSplashRuntimeState;
};

const readPersistedTransitionCompletion = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(SPLASH_TRANSITION_COMPLETED_SESSION_KEY) === '1';
  } catch {
    return false;
  }
};

const persistTransitionCompletion = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(SPLASH_TRANSITION_COMPLETED_SESSION_KEY, '1');
  } catch {
    // Ignore storage access issues and keep in-memory state only.
  }
};

const createLaunchSplashRuntimeState = (): LaunchSplashRuntimeState => {
  return {
    transitionCompleted: readPersistedTransitionCompletion(),
    launchStartedAt: null,
    minimumWindowMs: null,
    launchEffectsConsumed: false,
  };
};

export const getLaunchSplashRuntimeState = (): LaunchSplashRuntimeState => {
  const splashGlobal = globalThis as SplashRuntimeGlobal;
  if (splashGlobal.__profitLensLaunchSplashRuntimeState) {
    return splashGlobal.__profitLensLaunchSplashRuntimeState;
  }

  const runtimeState = createLaunchSplashRuntimeState();
  splashGlobal.__profitLensLaunchSplashRuntimeState = runtimeState;
  return runtimeState;
};

export const markLaunchSplashTransitionCompleted = (): void => {
  const runtimeState = getLaunchSplashRuntimeState();
  if (runtimeState.transitionCompleted) {
    return;
  }

  runtimeState.transitionCompleted = true;
  persistTransitionCompletion();
};

export interface LaunchSplashRuntimeState {
  transitionCompleted: boolean;
  launchStartedAt: number | null;
  minimumWindowMs: number | null;
  launchEffectsConsumed: boolean;
}

type SplashRuntimeGlobal = typeof globalThis & {
  __profitLensLaunchSplashRuntimeState?: LaunchSplashRuntimeState;
};

const createLaunchSplashRuntimeState = (): LaunchSplashRuntimeState => {
  return {
    transitionCompleted: false,
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

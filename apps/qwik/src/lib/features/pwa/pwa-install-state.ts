const pwaDisplayModes = [
  '(display-mode: standalone)',
  '(display-mode: fullscreen)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
];

export interface PwaNavigatorLike {
  standalone?: boolean;
  userAgent?: string;
  platform?: string;
  maxTouchPoints?: number;
}

export interface PwaWindowLike {
  matchMedia?: (query: string) => MediaQueryList | { matches: boolean };
  navigator?: PwaNavigatorLike;
}

export const isRunningAsInstalledPwa = (browser: PwaWindowLike | undefined): boolean => {
  if (!browser) {
    return false;
  }

  const iosStandalone =
    browser.navigator &&
    'standalone' in browser.navigator &&
    browser.navigator.standalone === true;
  if (iosStandalone) {
    return true;
  }

  const matchMedia = browser.matchMedia;
  if (!matchMedia) {
    return false;
  }

  return pwaDisplayModes.some((query) => matchMedia(query).matches);
};

const userAgentContainsIos = (userAgent: string): boolean => {
  return (
    userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod')
  );
};

const isIpadOsDesktopMode = (platform: string, maxTouchPoints: number): boolean => {
  return platform.includes('mac') && maxTouchPoints > 1;
};

const userAgentContainsMobileOs = (userAgent: string): boolean => {
  return (
    userAgent.includes('android') ||
    userAgent.includes('iphone') ||
    userAgent.includes('ipad') ||
    userAgent.includes('ipod') ||
    userAgent.includes('mobile')
  );
};

const platformLooksDesktop = (platform: string): boolean => {
  return (
    platform.includes('mac') ||
    platform.includes('win') ||
    platform.includes('linux') ||
    platform.includes('x11') ||
    platform.includes('cros')
  );
};

const hasFinePointer = (browser: PwaWindowLike): boolean => {
  const matchMedia = browser.matchMedia;
  if (!matchMedia) {
    return false;
  }
  return matchMedia('(pointer: fine)').matches;
};

export const shouldEnforcePwaInstallGate = (browser: PwaWindowLike | undefined): boolean => {
  if (!browser) {
    return true;
  }

  const navigator = browser.navigator;
  if (!navigator) {
    return true;
  }

  const platform = navigator.platform?.toLowerCase() ?? '';
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  if (isIpadOsDesktopMode(platform, maxTouchPoints)) {
    return true;
  }

  if (platformLooksDesktop(platform) && maxTouchPoints <= 1) {
    return false;
  }

  if (hasFinePointer(browser) && maxTouchPoints <= 1) {
    return false;
  }

  const userAgent = navigator.userAgent?.toLowerCase() ?? '';
  if (userAgentContainsMobileOs(userAgent)) {
    return true;
  }

  return false;
};

export const isIosInstallManualOnly = (browser: PwaWindowLike | undefined): boolean => {
  if (!browser || isRunningAsInstalledPwa(browser)) {
    return false;
  }

  const navigator = browser.navigator;
  if (!navigator) {
    return false;
  }

  const userAgent = navigator.userAgent?.toLowerCase() ?? '';
  if (userAgentContainsIos(userAgent)) {
    return true;
  }

  const platform = navigator.platform?.toLowerCase() ?? '';
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;
  return isIpadOsDesktopMode(platform, maxTouchPoints);
};

const pwaDisplayModes = [
  '(display-mode: standalone)',
  '(display-mode: fullscreen)',
  '(display-mode: minimal-ui)',
  '(display-mode: window-controls-overlay)',
];

export interface PwaWindowLike {
  matchMedia?: (query: string) => MediaQueryList | { matches: boolean };
  navigator?: Navigator | { standalone?: boolean };
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

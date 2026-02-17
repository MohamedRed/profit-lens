export const shouldUseDirectGalleryImport = (browser: Window | undefined): boolean => {
  if (!browser) {
    return false;
  }

  const userAgent = browser.navigator.userAgent.toLowerCase();
  const platform = (browser.navigator.platform ?? '').toLowerCase();
  const maxTouchPoints = browser.navigator.maxTouchPoints ?? 0;
  const isIosUserAgent =
    userAgent.includes('iphone') || userAgent.includes('ipad') || userAgent.includes('ipod');
  const isIpadDesktopMode = platform.includes('mac') && maxTouchPoints > 1;

  return isIosUserAgent || isIpadDesktopMode;
};

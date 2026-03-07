import { t, type I18nStore } from '../../../../lib/i18n/i18n-context';
import { isRunningAsInstalledPwa, type PwaWindowLike } from '../../../../lib/features/pwa/pwa-install-state';

const isAndroidUserAgent = (userAgent: string): boolean => {
  return userAgent.includes('android');
};

const isChromeLikeUserAgent = (userAgent: string): boolean => {
  return userAgent.includes('chrome') || userAgent.includes('crios');
};

export const resolveOfferLocationPermissionGuidance = (
  i18n: I18nStore,
  browser: PwaWindowLike | undefined,
): string | null => {
  const userAgent = browser?.navigator?.userAgent?.toLowerCase() ?? '';
  if (!isAndroidUserAgent(userAgent)) {
    return t(
      i18n,
      'offerLocationPermissionBrowserGuidance',
      'If no popup appears, allow location in your browser site settings, then try again.',
    );
  }

  if (isRunningAsInstalledPwa(browser)) {
    return t(
      i18n,
      'offerLocationPermissionAndroidPwaGuidance',
      'If no popup appears, turn on Android location, then open Profit Lens in Chrome and allow Location in site settings.',
    );
  }

  if (isChromeLikeUserAgent(userAgent)) {
    return t(
      i18n,
      'offerLocationPermissionChromeGuidance',
      'If no popup appears, turn on Android location and allow Location for this site in Chrome settings.',
    );
  }

  return t(
    i18n,
    'offerLocationPermissionAndroidBrowserGuidance',
    'If no popup appears, turn on Android location and allow Location for this site in your browser settings.',
  );
};

import { describe, expect, it } from 'vitest';
import type { I18nStore } from '../../../../lib/i18n/i18n-context';
import { resolveOfferLocationPermissionGuidance } from './offer-location-permission-guidance';

const createI18n = (dictionary: Record<string, string> = {}): I18nStore => {
  return {
    locale: { value: 'en' },
    direction: { value: 'ltr' },
    dictionary: { value: dictionary },
    ready: { value: true },
  } as unknown as I18nStore;
};

describe('offer-location-permission-guidance', () => {
  it('returns android pwa guidance when running installed on android', () => {
    const i18n = createI18n({
      offerLocationPermissionAndroidPwaGuidance:
        'If no popup appears, turn on Android location, then open Profit Lens in Chrome and allow Location in site settings.',
    });

    expect(
      resolveOfferLocationPermissionGuidance(i18n, {
        matchMedia: (query: string) => ({ matches: query === '(display-mode: standalone)' }),
        navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile Safari/537.36' },
      }),
    ).toBe(
      'If no popup appears, turn on Android location, then open Profit Lens in Chrome and allow Location in site settings.',
    );
  });

  it('returns chrome guidance on android chrome when not installed', () => {
    const i18n = createI18n({
      offerLocationPermissionChromeGuidance:
        'If no popup appears, turn on Android location and allow Location for this site in Chrome settings.',
    });

    expect(
      resolveOfferLocationPermissionGuidance(i18n, {
        matchMedia: () => ({ matches: false }),
        navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/131.0 Mobile Safari/537.36' },
      }),
    ).toBe(
      'If no popup appears, turn on Android location and allow Location for this site in Chrome settings.',
    );
  });

  it('returns generic browser guidance off android', () => {
    const i18n = createI18n({
      offerLocationPermissionBrowserGuidance:
        'If no popup appears, allow location in your browser site settings, then try again.',
    });

    expect(
      resolveOfferLocationPermissionGuidance(i18n, {
        matchMedia: () => ({ matches: false }),
        navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
      }),
    ).toBe(
      'If no popup appears, allow location in your browser site settings, then try again.',
    );
  });
});

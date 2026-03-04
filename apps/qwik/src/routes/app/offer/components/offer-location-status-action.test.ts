import { describe, expect, it } from 'vitest';
import type { I18nStore } from '../../../../lib/i18n/i18n-context';
import {
  resolveOfferLocationStatusAction,
} from './offer-location-status-action';

const createI18n = (dictionary: Record<string, string> = {}): I18nStore => {
  return {
    locale: { value: 'en' },
    direction: { value: 'ltr' },
    dictionary: { value: dictionary },
    ready: { value: true },
  } as unknown as I18nStore;
};

describe('offer-location-status-action', () => {
  it('maps permission message to enable location action', () => {
    const i18n = createI18n({
      offerLocationPermissionRequired: 'Location permission is required to analyze an offer.',
      offerLocationEnableActionLabel: 'Enable location',
    });

    expect(
      resolveOfferLocationStatusAction(
        i18n,
        'Location permission is required to analyze an offer.',
      ),
    ).toEqual({
      kind: 'permission',
      actionLabel: 'Enable location',
    });
  });

  it('maps timeout message to try again action', () => {
    const i18n = createI18n({
      offerLocationTimeout: 'Location took too long to load. Try again in an open area.',
      offerLocationTryAgainActionLabel: 'Try again',
    });

    expect(
      resolveOfferLocationStatusAction(
        i18n,
        'Location took too long to load. Try again in an open area.',
      ),
    ).toEqual({
      kind: 'retry',
      actionLabel: 'Try again',
    });
  });

  it('returns no action for unsupported location status', () => {
    const i18n = createI18n({
      offerLocationUnsupported: 'This device does not support location for offer analysis.',
    });

    expect(
      resolveOfferLocationStatusAction(
        i18n,
        'This device does not support location for offer analysis.',
      ),
    ).toBeNull();
  });
});

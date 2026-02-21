import { describe, expect, it } from 'vitest';
import type { I18nStore } from '../../../lib/i18n/i18n-context';
import {
  OfferLocationError,
  isOfferLocationError,
  resolveOfferLocationErrorMessage,
} from './offer-current-location';

const createI18n = (dictionary: Record<string, string> = {}): I18nStore => {
  return {
    locale: { value: 'en' },
    direction: { value: 'ltr' },
    dictionary: { value: dictionary },
    ready: { value: true },
  } as unknown as I18nStore;
};

describe('offer-current-location', () => {
  it('identifies OfferLocationError instances', () => {
    expect(isOfferLocationError(new OfferLocationError('permission-denied'))).toBe(true);
    expect(isOfferLocationError(new Error('x'))).toBe(false);
  });

  it('maps permission-denied to the translated message', () => {
    const i18n = createI18n({
      offerLocationPermissionRequired: 'Location permission is required.',
    });
    const message = resolveOfferLocationErrorMessage(i18n, 'permission-denied');
    expect(message).toBe('Location permission is required.');
  });

  it('uses fallback message for unknown location errors', () => {
    const i18n = createI18n();
    const message = resolveOfferLocationErrorMessage(i18n, 'unknown');
    expect(message).toBe('Unable to read your current location. Check GPS and try again.');
  });
});

import { t, type I18nStore } from '../../../lib/i18n/i18n-context';
import type { OfferCurrentLocation } from '../../../lib/types/offer';
import {
  prefetchOfferCurrentLocationWithPolicy,
  readOfferCurrentLocationWithPolicy,
} from './offer-location-policy';

export type OfferLocationErrorCode =
  | 'unsupported'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unknown';

interface ReadCurrentLocationOptions {
  preferCachedWithinMs?: number;
}

export class OfferLocationError extends Error {
  readonly code: OfferLocationErrorCode;

  constructor(code: OfferLocationErrorCode) {
    super(code);
    this.name = 'OfferLocationError';
    this.code = code;
  }
}

export const isOfferLocationError = (value: unknown): value is OfferLocationError => {
  return value instanceof OfferLocationError;
};

const mapGeolocationErrorCode = (code: number): OfferLocationErrorCode => {
  switch (code) {
    case 1:
      return 'permission-denied';
    case 2:
      return 'position-unavailable';
    case 3:
      return 'timeout';
    default:
      return 'unknown';
  }
};

const readCurrentLocationFromBrowser = async (
  options: PositionOptions,
): Promise<OfferCurrentLocation> => {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    throw new OfferLocationError('unsupported');
  }

  return await new Promise<OfferCurrentLocation>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          reject(new OfferLocationError('unknown'));
          return;
        }
        resolve({ lat: latitude, lng: longitude });
      },
      (error) => {
        reject(new OfferLocationError(mapGeolocationErrorCode(error.code)));
      },
      options,
    );
  });
};

export const readRequiredCurrentLocation = async (
  options?: ReadCurrentLocationOptions,
): Promise<OfferCurrentLocation> => {
  return await readOfferCurrentLocationWithPolicy({
    readCurrentLocation: readCurrentLocationFromBrowser,
    preferCachedWithinMs: options?.preferCachedWithinMs,
  });
};

export const prefetchOfferCurrentLocation = (): void => {
  void prefetchOfferCurrentLocationWithPolicy({
    readCurrentLocation: readCurrentLocationFromBrowser,
  });
};

export const resolveOfferLocationErrorMessage = (
  i18n: I18nStore,
  code: OfferLocationErrorCode,
): string => {
  switch (code) {
    case 'permission-denied':
      return t(
        i18n,
        'offerLocationPermissionRequired',
        'Location permission is required to analyze an offer.',
      );
    case 'position-unavailable':
      return t(
        i18n,
        'offerLocationUnavailable',
        'Unable to read your current location. Check GPS and try again.',
      );
    case 'timeout':
      return t(
        i18n,
        'offerLocationTimeout',
        'Location took too long to load. Try again in an open area.',
      );
    case 'unsupported':
      return t(
        i18n,
        'offerLocationUnsupported',
        'This device does not support location for offer analysis.',
      );
    default:
      return t(
        i18n,
        'offerLocationUnavailable',
        'Unable to read your current location. Check GPS and try again.',
      );
  }
};

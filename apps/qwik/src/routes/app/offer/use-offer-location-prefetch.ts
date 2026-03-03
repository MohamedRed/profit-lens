import { useVisibleTask$ } from '@builder.io/qwik';
import { prefetchOfferCurrentLocation } from './offer-current-location';

export const useOfferLocationPrefetch = (): void => {
  useVisibleTask$(() => {
    const prefetchIfGranted = async () => {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return;
      }
      if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
        return;
      }
      try {
        const permissionStatus = await navigator.permissions.query({
          name: 'geolocation',
        });
        if (permissionStatus.state !== 'granted') {
          return;
        }
      } catch {
        return;
      }
      prefetchOfferCurrentLocation();
    };
    void prefetchIfGranted();
  });
};

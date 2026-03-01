import { useVisibleTask$ } from '@builder.io/qwik';
import { prefetchOfferCurrentLocation } from './offer-current-location';

export const useOfferLocationPrefetch = (): void => {
  useVisibleTask$(() => {
    prefetchOfferCurrentLocation();
  });
};

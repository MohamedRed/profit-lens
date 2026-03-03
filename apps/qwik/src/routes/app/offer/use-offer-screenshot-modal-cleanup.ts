import { useVisibleTask$, type Signal } from '@builder.io/qwik';
import { revokeOfferScreenshotModalUrl } from '../../../lib/features/offers/offer-screenshot-modal-url';

export const useOfferScreenshotModalCleanup = (
  screenshotModalUrl: Signal<string | null>,
): void => {
  useVisibleTask$(({ cleanup }) => {
    cleanup(() => {
      revokeOfferScreenshotModalUrl(screenshotModalUrl.value);
    });
  });
};

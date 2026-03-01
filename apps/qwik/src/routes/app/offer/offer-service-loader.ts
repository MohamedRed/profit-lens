type OffersServiceModule =
  typeof import('../../../lib/features/offers/offers-service');

let offersServicePromise: Promise<OffersServiceModule> | null = null;

export const loadOffersService = () => {
  if (!offersServicePromise) {
    offersServicePromise = import('../../../lib/features/offers/offers-service');
  }
  return offersServicePromise;
};

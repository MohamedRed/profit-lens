type OffersServiceModule = typeof import('../../../lib/features/offers/offers-service');

type LoadOffersService = () => Promise<OffersServiceModule>;

interface AnalyzeManualOfferActionParams {
  deviceId: string;
  distance: string;
  dropoffAddress: string;
  dropoffName: string;
  duration: string;
  loadOffersService: LoadOffersService;
  payout: string;
  pickupAddress: string;
  pickupName: string;
  vehicleId?: string;
}

interface VerifyOfferRouteActionParams {
  dropoffAddress: string;
  loadOffersService: LoadOffersService;
  pickupAddress: string;
}

interface AnalyzeScreenshotOfferActionParams {
  deviceId: string;
  file: File;
  loadOffersService: LoadOffersService;
  vehicleId?: string;
}

export const analyzeManualOfferAction = async ({
  deviceId,
  distance,
  dropoffAddress,
  dropoffName,
  duration,
  loadOffersService,
  payout,
  pickupAddress,
  pickupName,
  vehicleId,
}: AnalyzeManualOfferActionParams): Promise<Record<string, unknown>> => {
  const { analyzeManualOffer } = await loadOffersService();
  return analyzeManualOffer({
    deviceId,
    vehicleId,
    source: 'manual',
    offer: {
      payoutEuro: Number(payout || 0),
      distanceKm: Number(distance || 0),
      durationMinutes: Number(duration || 0),
      pickupName,
      pickupAddress,
      dropoffName,
      dropoffAddress,
    },
  });
};

export const verifyOfferRouteAction = async ({
  dropoffAddress,
  loadOffersService,
  pickupAddress,
}: VerifyOfferRouteActionParams): Promise<Record<string, unknown>> => {
  const { verifyOfferRoute } = await loadOffersService();
  return verifyOfferRoute({
    pickupAddress,
    dropoffAddress,
  });
};

export const analyzeScreenshotOfferAction = async ({
  deviceId,
  file,
  loadOffersService,
  vehicleId,
}: AnalyzeScreenshotOfferActionParams): Promise<Record<string, unknown>> => {
  const { analyzeScreenshotOffer } = await loadOffersService();
  return analyzeScreenshotOffer({
    deviceId,
    file,
    vehicleId,
  });
};

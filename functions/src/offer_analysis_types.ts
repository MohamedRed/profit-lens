import { OfferInput } from "./profitability_types";

export type AnalyzeOfferPayload = {
  offer?: OfferInput;
  currentLocation?: {
    lat?: number;
    lng?: number;
  };
  vehicleId?: string;
  source?: string;
  extraction?: { confidence?: number; rawText?: string | null };
  imageBase64?: string;
  mimeType?: string;
  deviceId?: string;
  timezone?: string;
};

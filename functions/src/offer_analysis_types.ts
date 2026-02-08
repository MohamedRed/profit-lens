import { OfferInput } from "./profitability_types";

export type AnalyzeOfferPayload = {
  offer?: OfferInput;
  vehicleId?: string;
  source?: string;
  extraction?: { confidence?: number; rawText?: string | null };
  imageBase64?: string;
  mimeType?: string;
  deviceId?: string;
};

import { HttpsError } from "firebase-functions/v2/https";
import { fetchWithTimeout } from "./http_fetch_timeout";

type GeocodedLocation = {
  lat: number;
  lng: number;
};

type GeocodingResponse = {
  status?: string;
  error_message?: string;
  results?: Array<{
    geometry?: {
      location?: {
        lat?: number;
        lng?: number;
      };
    };
  }>;
};

const GEOCODING_API_URL = "https://maps.googleapis.com/maps/api/geocode/json";
const GEOCODING_API_TIMEOUT_MS = 5000;

type GeocodeRequest = {
  apiKey: string;
  address: string;
};

export async function geocodeAddress(
  request: GeocodeRequest
): Promise<GeocodedLocation> {
  const url = new URL(GEOCODING_API_URL);
  url.searchParams.set("key", request.apiKey);
  url.searchParams.set("address", request.address);

  const response = await fetchWithTimeout({
    url: url.toString(),
    timeoutMs: GEOCODING_API_TIMEOUT_MS,
    timeoutMessage: "Geocoding API request timed out.",
    unavailableMessage: "Geocoding API request failed",
  });
  if (!response.ok) {
    throw new HttpsError(
      "internal",
      `Geocoding API request failed (${response.status}).`
    );
  }

  const data = (await response.json()) as GeocodingResponse;
  if (data.status && data.status !== "OK") {
    const message = data.error_message
      ? `Geocoding API error (${data.status}).`
      : `Geocoding API error (${data.status}).`;
    throw new HttpsError("internal", message);
  }

  const location = data.results?.[0]?.geometry?.location;
  if (location?.lat == null || location?.lng == null) {
    throw new HttpsError("internal", "Geocoding API returned no results.");
  }

  return {
    lat: location.lat,
    lng: location.lng,
  };
}

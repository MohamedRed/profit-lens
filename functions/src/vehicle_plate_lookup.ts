import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
  fetchVehicleByPlate,
  mapEnergyLabel,
  normalizeFrenchPlate,
} from "./api_plaque_client";

const apiPlaqueToken = defineSecret("API_PLAQUE_TOKEN");

export const lookupVehicleByPlate = onCall(
  {
    cors: true,
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
    secrets: [apiPlaqueToken],
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const payload = request.data as {
      licensePlate?: string;
      countryCode?: string;
    };
    const rawPlate = payload?.licensePlate?.trim();
    const countryCode = payload?.countryCode?.trim().toUpperCase();
    if (!rawPlate || !countryCode) {
      throw new HttpsError("invalid-argument", "Missing lookup payload.");
    }
    if (countryCode != "FR") {
      throw new HttpsError("failed-precondition", "Unsupported country.");
    }
    const token = apiPlaqueToken.value();
    if (!token) {
      throw new HttpsError(
        "failed-precondition",
        "API_PLAQUE_TOKEN is not set."
      );
    }
    const plate = normalizeFrenchPlate(rawPlate);
    if (!plate) {
      throw new HttpsError("invalid-argument", "Invalid plate input.");
    }
    const vehicle = await fetchVehicleByPlate({
      plate,
      token,
      countryCode,
    });
    if (!vehicle) {
      return { match: false };
    }
    const energy = mapEnergyLabel(vehicle.energyLabel);
    return {
      match: true,
      licensePlate: plate,
      brand: vehicle.brand,
      model: vehicle.model,
      registrationYear: vehicle.registrationYear,
      ...(energy.energyType ? { energyType: energy.energyType } : {}),
      ...(energy.fuelType ? { fuelType: energy.fuelType } : {}),
    };
  }
);

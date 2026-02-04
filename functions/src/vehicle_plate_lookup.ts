import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import {
  fetchVehicleByPlate,
  mapEnergyLabel,
  normalizeFrenchPlate,
} from "./plate_lookup_client";

const rapidApiPlateKey = defineSecret("RAPIDAPI_PLAQUE_KEY");

export const lookupVehicleByPlate = onCall(
  {
    cors: true,
    timeoutSeconds: 20,
    memory: "256MiB",
    region: "europe-west1",
    secrets: [rapidApiPlateKey],
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
    const apiKey = rapidApiPlateKey.value();
    if (!apiKey) {
      throw new HttpsError(
        "failed-precondition",
        "RAPIDAPI_PLAQUE_KEY is not set."
      );
    }
    const plate = normalizeFrenchPlate(rawPlate);
    if (!plate) {
      throw new HttpsError("invalid-argument", "Invalid plate input.");
    }
    let vehicle;
    try {
      vehicle = await fetchVehicleByPlate({
        plate,
        apiKey,
      });
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError("internal", "Vehicle lookup failed.");
    }
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

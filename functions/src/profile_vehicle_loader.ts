import { HttpsError } from "firebase-functions/v2/https";
import { db } from "./firebase_admin";
import {
  CostSettings,
  FixedCostAllocation,
  VehicleSnapshot,
} from "./profitability_types";

type ProfileLoadResult = {
  costSettings: CostSettings;
  defaultVehicleId?: string | null;
};

export async function loadUserProfile(uid: string): Promise<ProfileLoadResult> {
  const doc = await db.collection("users").doc(uid).get();
  if (!doc.exists) {
    throw new HttpsError("failed-precondition", "User profile not found.");
  }
  const data = doc.data() ?? {};
  const allocation = parseFixedCostAllocation(data.fixedCostAllocation as string | undefined);
  const socialRate = toNumber(data.socialContributionRate);
  const fixedCosts = toNumber(data.monthlyFixedCosts);
  const monthlyHours = toNumber(data.monthlyWorkingHours);
  const monthlyDistance = toNumber(data.monthlyDistanceKm);
  const monthlyDeliveries = toInt(data.monthlyDeliveries);

  if (
    !allocation ||
    socialRate == null ||
    fixedCosts == null ||
    monthlyHours == null ||
    monthlyDistance == null ||
    monthlyDeliveries == null
  ) {
    throw new HttpsError(
      "failed-precondition",
      "User profile is missing required cost settings."
    );
  }

  return {
    costSettings: {
      socialContributionRate: socialRate,
      incomeTaxRate: toNumber(data.incomeTaxRate),
      fixedCostAllocation: allocation,
      monthlyFixedCosts: fixedCosts,
      monthlyWorkingHours: monthlyHours,
      monthlyDistanceKm: monthlyDistance,
      monthlyDeliveries,
    },
    defaultVehicleId: (data.defaultVehicleId as string | undefined) ?? null,
  };
}

export async function loadVehicleSnapshot(
  uid: string,
  vehicleId: string
): Promise<VehicleSnapshot> {
  const doc = await db
    .collection("users")
    .doc(uid)
    .collection("vehicles")
    .doc(vehicleId)
    .get();
  if (!doc.exists) {
    throw new HttpsError("failed-precondition", "Vehicle not found.");
  }
  const data = doc.data() ?? {};
  const snapshot: VehicleSnapshot = {
    id: vehicleId,
    name: String(data.name ?? ""),
    brand: (data.brand as string | undefined) ?? null,
    model: (data.model as string | undefined) ?? null,
    type: String(data.type ?? ""),
    energyType: String(data.energyType ?? ""),
    fuelType: (data.fuelType as string | undefined) ?? null,
    energyConsumptionPer100Km: toNumber(data.energyConsumptionPer100Km) ?? 0,
    energyPricePerUnit: toNumber(data.energyPricePerUnit) ?? 0,
    maintenancePerKm: toNumber(data.maintenancePerKm) ?? 0,
    depreciationPerKm: toNumber(data.depreciationPerKm) ?? 0,
  };

  if (
    !snapshot.name ||
    !snapshot.type ||
    !snapshot.energyType ||
    snapshot.energyConsumptionPer100Km <= 0 ||
    snapshot.energyPricePerUnit <= 0
  ) {
    throw new HttpsError(
      "failed-precondition",
      "Vehicle snapshot is missing required fields."
    );
  }

  return snapshot;
}

function parseFixedCostAllocation(
  value?: string
): FixedCostAllocation | null {
  if (value === "perHour" || value === "perKm" || value === "perDelivery") {
    return value;
  }
  return null;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
}

function toInt(value: unknown): number | null {
  const num = toNumber(value);
  if (num == null) return null;
  return Math.round(num);
}

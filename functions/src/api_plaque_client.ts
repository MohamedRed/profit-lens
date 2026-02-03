export type ApiPlaqueVehicle = {
  brand?: string;
  model?: string;
  registrationYear?: number;
  energyLabel?: string;
};

const API_PLAQUE_URL =
  "https://api.apiplaqueimmatriculation.com/plaque";

export function normalizeFrenchPlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function fetchVehicleByPlate(params: {
  plate: string;
  token: string;
  countryCode: string;
}): Promise<ApiPlaqueVehicle | null> {
  const url = new URL(API_PLAQUE_URL);
  url.searchParams.set("immatriculation", params.plate);
  url.searchParams.set("token", params.token);
  url.searchParams.set("pays", params.countryCode);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`API Plaque request failed (${response.status}).`);
  }
  const payload = (await response.json()) as Record<string, unknown>;
  const data = payload?.data;
  if (!data || typeof data !== "object") {
    return null;
  }
  const dataRecord = data as Record<string, unknown>;
  const error = asString(dataRecord.erreur);
  if (error) {
    return null;
  }
  const brand = asString(dataRecord.marque);
  const model = asString(dataRecord.modele);
  const registrationYear = parseYear(
    asString(dataRecord.date1erCir_us) ?? asString(dataRecord.date1erCir_fr)
  );
  const energyLabel = asString(dataRecord.energieNGC);
  if (!brand && !model && !registrationYear && !energyLabel) {
    return null;
  }
  return {
    brand,
    model,
    registrationYear,
    energyLabel,
  };
}

export function mapEnergyLabel(label?: string): {
  energyType?: string;
  fuelType?: string;
} {
  if (!label) {
    return {};
  }
  const normalized = label.toUpperCase();
  const hasFuel =
    normalized.includes("DIESEL") ||
    normalized.includes("ESSENCE") ||
    normalized.includes("GPL") ||
    normalized.includes("BIO") ||
    normalized.includes("E85") ||
    normalized.includes("SP95") ||
    normalized.includes("SP98") ||
    normalized.includes("E10") ||
    normalized.includes("HYBR");
  const hasElectric = normalized.includes("ELECT");
  const energyType = hasElectric && !hasFuel
    ? "electric"
    : hasFuel
      ? "fuel"
      : undefined;

  let fuelType: string | undefined;
  if (normalized.includes("DIESEL")) {
    fuelType = "gazole";
  } else if (normalized.includes("BIO") || normalized.includes("E85")) {
    fuelType = "e85";
  } else if (normalized.includes("GPL")) {
    fuelType = "gplc";
  } else if (normalized.includes("E10")) {
    fuelType = "e10";
  } else if (normalized.includes("SP98")) {
    fuelType = "sp98";
  } else if (normalized.includes("SP95")) {
    fuelType = "sp95";
  }

  return {
    energyType,
    fuelType,
  };
}

function asString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length == 0 ? undefined : trimmed;
}

function parseYear(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = value.match(/(\d{4})/);
  if (!match) {
    return undefined;
  }
  const year = Number(match[1]);
  return Number.isNaN(year) ? undefined : year;
}

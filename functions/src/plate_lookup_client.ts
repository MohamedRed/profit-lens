import { HttpsError } from "firebase-functions/v2/https";

export type PlateLookupVehicle = {
  brand?: string;
  model?: string;
  registrationYear?: number;
  energyLabel?: string;
};

const RAPIDAPI_HOST = "api-de-plaque-d-immatriculation-france.p.rapidapi.com";
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}/`;
const SIV_PATTERN = /^[A-Z]{2}\d{3}[A-Z]{2}$/;

export function normalizeFrenchPlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function formatFrenchPlate(value: string): string {
  const normalized = normalizeFrenchPlate(value);
  if (SIV_PATTERN.test(normalized)) {
    return `${normalized.slice(0, 2)}-${normalized.slice(2, 5)}-${normalized.slice(5)}`;
  }
  return normalized;
}

export async function fetchVehicleByPlate(params: {
  plate: string;
  apiKey: string;
}): Promise<PlateLookupVehicle | null> {
  const normalized = normalizeFrenchPlate(params.plate);
  if (!normalized) {
    return null;
  }

  const url = new URL(RAPIDAPI_URL);
  url.searchParams.set("plaque", formatFrenchPlate(normalized));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "x-rapidapi-host": RAPIDAPI_HOST,
      "x-rapidapi-key": params.apiKey,
    },
  });

  if (!response.ok) {
    const status = response.status;
    const code = status === 401 || status === 403 ? "failed-precondition" : "internal";
    const message =
      status === 401 || status === 403
        ? "Vehicle lookup service authentication failed."
        : `Vehicle lookup request failed (${status}).`;
    throw new HttpsError(code, message);
  }

  const payload = (await response.json()) as unknown;
  return parsePlatePayload(payload);
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
    normalized.includes("GAZOLE") ||
    normalized.includes("GASOIL") ||
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
  if (
    normalized.includes("DIESEL") ||
    normalized.includes("GAZOLE") ||
    normalized.includes("GASOIL")
  ) {
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

function parsePlatePayload(payload: unknown): PlateLookupVehicle | null {
  const record = asRecord(payload);
  if (!record) {
    return null;
  }

  if (isErrorResponse(record)) {
    return null;
  }

  const dataRecord = extractDataRecord(record);
  if (!dataRecord) {
    return null;
  }

  const brand = pickString(dataRecord, ["AWN_marque", "marque", "brand", "make"]);
  const model = pickString(dataRecord, [
    "AWN_modele",
    "AWN_modele_prf",
    "AWN_nom_commercial",
    "AWN_label",
    "modele",
    "model",
  ]);
  const registrationYear = parseYear(
    pickString(dataRecord, [
      "AWN_date_mise_en_circulation_us",
      "AWN_date_mise_en_circulation",
      "AWN_date_cg",
      "date1erCir_us",
      "date1erCir_fr",
      "date1erCir",
      "date_1ere_immatriculation",
    ])
  );
  const energyLabel = pickString(dataRecord, [
    "AWN_energie",
    "AWN_energie_cg",
    "energieNGC",
    "energie",
    "energy",
  ]);

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

function extractDataRecord(
  record: Record<string, unknown>
): Record<string, unknown> | null {
  const dataValue = record.data;
  if (isRecord(dataValue)) {
    return dataValue;
  }
  if (Array.isArray(dataValue)) {
    const first = dataValue[0];
    return isRecord(first) ? first : null;
  }
  if (Object.prototype.hasOwnProperty.call(record, "data")) {
    return null;
  }
  return record;
}

function isErrorResponse(record: Record<string, unknown>): boolean {
  if (record.error === true) {
    return true;
  }
  const code = asNumber(record.code);
  if (code != null && code >= 400) {
    return true;
  }
  const dataValue = record.data;
  if (Array.isArray(dataValue) && dataValue.length === 0) {
    return true;
  }
  const message = asString(record.message);
  if (message && message.toLowerCase().includes("non valide")) {
    return true;
  }
  return false;
}

function pickString(
  record: Record<string, unknown>,
  keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = asString(record[key]);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return asRecord(value) !== null;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
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

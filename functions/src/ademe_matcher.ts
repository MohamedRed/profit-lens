import { AdemeRecord } from "./ademe_dataset";

export type LookupEnergy = "electric" | "fuel";

export function findAdemeMatch(
  records: AdemeRecord[],
  brand: string,
  model: string,
  energy?: LookupEnergy
): AdemeRecord | null {
  const targetBrand = normalizeText(brand);
  const targetModel = normalizeText(model);
  let best: { record: AdemeRecord; score: number } | null = null;

  for (const record of records) {
    if (normalizeText(record.brand) != targetBrand) {
      continue;
    }
    if (energy && !matchesEnergy(record.energy, energy)) {
      continue;
    }
    const score = matchScore(record, targetModel);
    if (score == 0) {
      continue;
    }
    if (!best || score > best.score) {
      best = { record, score };
    }
  }
  return best?.record ?? null;
}

function matchScore(record: AdemeRecord, targetModel: string): number {
  const fields = [record.modelLabel, record.model, record.description].map(
    normalizeText
  );
  if (fields.some((value) => value == targetModel)) {
    return 3;
  }
  if (fields.some((value) => value.includes(targetModel))) {
    return 2;
  }
  if (fields.some((value) => targetModel.includes(value) && value.length > 3)) {
    return 1;
  }
  return 0;
}

function matchesEnergy(value: string, energy: LookupEnergy): boolean {
  const normalized = normalizeText(value);
  if (energy == "electric") {
    return normalized.includes("electrique") || normalized.includes("electric");
  }
  return !normalized.includes("electrique") && !normalized.includes("electric");
}

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

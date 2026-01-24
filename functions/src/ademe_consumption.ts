import { AdemeRecord } from "./ademe_dataset";
import { LookupEnergy } from "./ademe_matcher";

export function selectConsumption(
  record: AdemeRecord,
  energy: LookupEnergy
): number | null {
  if (energy == "electric") {
    return averageOf(record.consoElecMin, record.consoElecMax);
  }
  return averageOf(record.consoMixteMin, record.consoMixteMax);
}

function averageOf(minValue: string, maxValue: string): number | null {
  const min = parseFrenchNumber(minValue);
  const max = parseFrenchNumber(maxValue);
  if (min == null && max == null) {
    return null;
  }
  if (min != null && max != null) {
    return (min + max) / 2;
  }
  return min ?? max ?? null;
}

function parseFrenchNumber(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  return Number.isNaN(Number(normalized)) ? null : Number(normalized);
}

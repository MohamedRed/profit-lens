import { parse } from "csv-parse/sync";

export type AdemeRecord = {
  brand: string;
  modelLabel: string;
  model: string;
  description: string;
  energy: string;
  consoMixteMin: string;
  consoMixteMax: string;
  consoElecMin: string;
  consoElecMax: string;
};

const ADEME_DATA_URL =
  "https://koumoul.com/s/data-fair/api/v1/datasets/ademe-car-labelling/raw";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedRecords: AdemeRecord[] | null = null;
let cachedAt = 0;

export async function loadAdemeRecords(): Promise<AdemeRecord[]> {
  if (cachedRecords && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRecords;
  }
  const csvText = await fetchCsv(ADEME_DATA_URL);
  const rows = parse(csvText, {
    columns: true,
    delimiter: ";",
    skip_empty_lines: true,
  }) as Record<string, string>[];

  cachedRecords = rows.map((row) => ({
    brand: valueOf(row["Marque"]),
    modelLabel: valueOf(row["Libellé modèle"]),
    model: valueOf(row["Modèle"]),
    description: valueOf(row["Description Commerciale"]),
    energy: valueOf(row["Energie"]),
    consoMixteMin: valueOf(row["Conso vitesse mixte Min"]),
    consoMixteMax: valueOf(row["Conso vitesse mixte Max"]),
    consoElecMin: valueOf(row["Conso elec Min"]),
    consoElecMax: valueOf(row["Conso elec Max"]),
  }));
  cachedAt = Date.now();
  return cachedRecords;
}

async function fetchCsv(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ADEME dataset error (${response.status}).`);
  }
  return response.text();
}

function valueOf(value: string | undefined): string {
  return (value ?? "").trim();
}

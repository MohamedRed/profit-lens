type OfferPayload = {
  offer?: {
    pickupName?: string | null;
    pickupAddress?: string | null;
    dropoffName?: string | null;
    dropoffAddress?: string | null;
  };
  rawText?: string;
};

const ADDRESS_LINE_REGEX =
  /(\b\d{1,5}\b[^\n]*\b(?:rue|avenue|av\.?|boulevard|bd\.?|place|chemin|route|allee|allée|impasse|quai|cours|square|voie|sentier|parvis|passage|esplanade)\b[^\n]*\b\d{5}\b[^\n]*)/i;

const POSTAL_CODE_REGEX = /\b\d{5}\b/;

export function postprocessOfferExtraction(payload: OfferPayload) {
  if (!payload.offer || !payload.rawText) {
    return payload;
  }

  const addresses = extractAddresses(payload.rawText);
  if (addresses.length === 0) {
    return payload;
  }

  const offer = payload.offer;
  const pickupAddress = offer.pickupAddress?.trim() ?? "";
  const dropoffAddress = offer.dropoffAddress?.trim() ?? "";

  if (addresses.length >= 2) {
    if (!pickupAddress || !dropoffAddress) {
      offer.pickupAddress = addresses[0];
      offer.dropoffAddress = addresses[addresses.length - 1];
    }
    return payload;
  }

  const single = addresses[0];
  if (!dropoffAddress) {
    offer.dropoffAddress = single;
  }
  if (pickupAddress && pickupAddress == single) {
    offer.pickupAddress = null;
  }
  if (!pickupAddress && offer.pickupName && offer.dropoffAddress == single) {
    offer.pickupAddress = null;
  }
  return payload;
}

function extractAddresses(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => line.replace(/^[-•–]\s*/, "").trim())
    .filter(Boolean);

  const addresses: string[] = [];
  for (const line of lines) {
    const match = line.match(ADDRESS_LINE_REGEX);
    if (match?.[1]) {
      addresses.push(match[1].trim());
      continue;
    }
    if (POSTAL_CODE_REGEX.test(line) && looksLikeStreet(line)) {
      addresses.push(line);
    }
  }

  return unique(addresses);
}

function looksLikeStreet(line: string) {
  const lower = line.toLowerCase();
  return (
    lower.includes(" rue ") ||
    lower.startsWith("rue ") ||
    lower.includes(" avenue ") ||
    lower.startsWith("avenue ") ||
    lower.includes(" av ") ||
    lower.includes(" av.") ||
    lower.startsWith("av ") ||
    lower.startsWith("av.") ||
    lower.includes(" boulevard ") ||
    lower.startsWith("boulevard ") ||
    lower.includes(" bd ") ||
    lower.startsWith("bd ") ||
    lower.includes(" place ") ||
    lower.startsWith("place ") ||
    lower.includes(" chemin ") ||
    lower.startsWith("chemin ") ||
    lower.includes(" route ") ||
    lower.startsWith("route ") ||
    lower.includes(" allée ") ||
    lower.includes(" allee ") ||
    lower.includes(" impasse ") ||
    lower.includes(" quai ") ||
    lower.includes(" cours ") ||
    lower.includes(" square ") ||
    lower.includes(" voie ") ||
    lower.includes(" passage ") ||
    lower.includes(" esplanade ") ||
    lower.includes(" parvis ")
  );
}

function unique(values: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      result.push(value);
    }
  }
  return result;
}

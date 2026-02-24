const maxNestedDecodeDepth = 4;

const decodeRepeated = (raw: string): string => {
  let current = raw;
  for (let depth = 0; depth < maxNestedDecodeDepth; depth += 1) {
    try {
      const decoded = decodeURIComponent(current);
      if (decoded === current) {
        break;
      }
      current = decoded;
    } catch {
      break;
    }
  }
  return current;
};

const decodeVehicleId = (raw: string | null | undefined): string | null => {
  if (typeof raw !== 'string') {
    return null;
  }
  const normalized = decodeRepeated(raw).trim();
  if (!normalized || normalized.includes('/')) {
    return null;
  }
  const keyword = normalized.toLowerCase();
  if (keyword === 'new' || keyword === 'edit') {
    return null;
  }
  return normalized;
};

const readFromPath = (path: string): string | null => {
  const legacyEditMatch = path.match(/\/(?:next\/)?app\/settings\/vehicles\/edit\/([^/?#]+)\/?$/);
  if (legacyEditMatch) {
    return decodeVehicleId(legacyEditMatch[1]);
  }

  const directMatch = path.match(/\/(?:next\/)?app\/settings\/vehicles\/([^/?#]+)\/?$/);
  if (directMatch) {
    return decodeVehicleId(directMatch[1]);
  }

  return null;
};

export const readVehicleEditorId = (
  paramsVehicleId: string | undefined,
  path: string,
  search: string,
): string | null => {
  const fromParams = decodeVehicleId(paramsVehicleId);
  if (fromParams) {
    return fromParams;
  }

  const searchParams = new URLSearchParams(search);
  const fromQuery = decodeVehicleId(searchParams.get('vehicleId') ?? searchParams.get('id'));
  if (fromQuery) {
    return fromQuery;
  }

  return readFromPath(path);
};

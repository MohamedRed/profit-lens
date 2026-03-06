import type { BulkParsedRow } from '../../../../lib/types/bulk-offers';
import type { VehicleProfile } from '../../../../lib/types/vehicle';

export const resolveLocalTodayIso = (now: Date = new Date()): string => {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export const resolveVehicleSelection = (
  previous: string,
  vehicles: VehicleProfile[],
  defaultVehicleId: string | null,
): string => {
  if (previous && vehicles.some((vehicle) => vehicle.id === previous)) {
    return previous;
  }
  if (defaultVehicleId && vehicles.some((vehicle) => vehicle.id === defaultVehicleId)) {
    return defaultVehicleId;
  }
  return vehicles[0]?.id ?? '';
};

export const patchBulkRow = (
  rows: BulkParsedRow[],
  index: number,
  patch: Partial<BulkParsedRow>,
): BulkParsedRow[] => {
  return rows.map((row, rowIndex) => {
    if (rowIndex !== index) {
      return row;
    }
    return { ...row, ...patch };
  });
};

export const removeBulkRow = (rows: BulkParsedRow[], index: number): BulkParsedRow[] => {
  return rows.filter((_, rowIndex) => rowIndex !== index);
};

import type { VehicleProfile } from '../../../../lib/types/vehicle';

export const resolveBulkDefaultVehicle = (
  vehicles: VehicleProfile[],
  defaultVehicleId: string | null,
): VehicleProfile | null => {
  if (!defaultVehicleId) {
    return null;
  }
  return vehicles.find((vehicle) => vehicle.id === defaultVehicleId) ?? null;
};

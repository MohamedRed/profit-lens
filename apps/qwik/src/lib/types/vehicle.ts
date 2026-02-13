export interface VehicleProfile {
  id: string;
  name: string;
  licensePlate?: string | null;
  brand?: string | null;
  model?: string | null;
  registrationYear?: number | null;
  type: string;
  energyType: string;
  fuelType?: string | null;
  energyConsumptionPer100Km: number;
  energyPricePerUnit: number;
  maintenancePerKm: number;
  depreciationPerKm: number;
}

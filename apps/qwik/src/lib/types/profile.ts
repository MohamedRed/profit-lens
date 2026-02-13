export interface UserProfile {
  uid: string;
  email: string | null;
  countryCode: string;
  currencyCode: string;
  activity: string;
  socialContributionRate: number;
  incomeTaxRate: number | null;
  useLiberatoryTax: boolean;
  fixedCostAllocation: string;
  monthlyFixedCosts: number;
  monthlyWorkingHours: number;
  monthlyDistanceKm: number;
  monthlyDeliveries: number;
  minProfitabilityEuro: number;
  defaultVehicleId: string | null;
  useFranceDefaults: boolean;
  preferredLocale: string;
}

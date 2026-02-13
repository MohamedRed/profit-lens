import { onSnapshot, setDoc, type QuerySnapshot } from 'firebase/firestore';
import type { UserProfile } from '../../types/profile';
import { userDoc, nowServer } from '../../firebase/firestore';

const defaultProfile = (uid: string, email: string | null): UserProfile => {
  return {
    uid,
    email,
    countryCode: 'FR',
    currencyCode: 'EUR',
    activity: 'deliveryServices',
    socialContributionRate: 0.212,
    incomeTaxRate: 0.017,
    useLiberatoryTax: true,
    fixedCostAllocation: 'perDelivery',
    monthlyFixedCosts: 0,
    monthlyWorkingHours: 160,
    monthlyDistanceKm: 3000,
    monthlyDeliveries: 120,
    minProfitabilityEuro: 2,
    defaultVehicleId: null,
    useFranceDefaults: true,
    preferredLocale: 'fr',
  };
};

const mapProfile = (uid: string, raw: Record<string, unknown> | undefined): UserProfile | null => {
  if (!raw) {
    return null;
  }

  const countryCode = raw.countryCode as string | undefined;
  const currencyCode = raw.currencyCode as string | undefined;
  const activity = raw.activity as string | undefined;
  const fixedCostAllocation = raw.fixedCostAllocation as string | undefined;
  const socialContributionRate = Number(raw.socialContributionRate ?? 0);

  if (!countryCode || !currencyCode || !activity || !fixedCostAllocation || !socialContributionRate) {
    return null;
  }

  return {
    uid,
    email: (raw.email as string | undefined) ?? null,
    countryCode,
    currencyCode,
    activity,
    socialContributionRate,
    incomeTaxRate:
      raw.incomeTaxRate === undefined || raw.incomeTaxRate === null
        ? null
        : Number(raw.incomeTaxRate),
    useLiberatoryTax: Boolean(raw.useLiberatoryTax ?? false),
    fixedCostAllocation,
    monthlyFixedCosts: Number(raw.monthlyFixedCosts ?? 0),
    monthlyWorkingHours: Number(raw.monthlyWorkingHours ?? 0),
    monthlyDistanceKm: Number(raw.monthlyDistanceKm ?? 0),
    monthlyDeliveries: Number(raw.monthlyDeliveries ?? 0),
    minProfitabilityEuro: Number(raw.minProfitabilityEuro ?? 2),
    defaultVehicleId: (raw.defaultVehicleId as string | undefined) ?? null,
    useFranceDefaults: Boolean(raw.useFranceDefaults ?? true),
    preferredLocale: (raw.preferredLocale as string | undefined) ?? 'fr',
  };
};

export const watchUserProfile = (
  uid: string,
  fallbackEmail: string | null,
  callback: (profile: UserProfile) => void,
): (() => void) => {
  return onSnapshot(userDoc(uid), (snapshot) => {
    const mapped = mapProfile(uid, snapshot.data() as Record<string, unknown> | undefined);
    callback(mapped ?? defaultProfile(uid, fallbackEmail));
  });
};

export const saveUserProfile = async (profile: UserProfile) => {
  await setDoc(
    userDoc(profile.uid),
    {
      email: profile.email,
      countryCode: profile.countryCode,
      currencyCode: profile.currencyCode,
      activity: profile.activity,
      socialContributionRate: profile.socialContributionRate,
      incomeTaxRate: profile.incomeTaxRate,
      useLiberatoryTax: profile.useLiberatoryTax,
      fixedCostAllocation: profile.fixedCostAllocation,
      monthlyFixedCosts: profile.monthlyFixedCosts,
      monthlyWorkingHours: profile.monthlyWorkingHours,
      monthlyDistanceKm: profile.monthlyDistanceKm,
      monthlyDeliveries: profile.monthlyDeliveries,
      minProfitabilityEuro: profile.minProfitabilityEuro,
      defaultVehicleId: profile.defaultVehicleId,
      useFranceDefaults: profile.useFranceDefaults,
      preferredLocale: profile.preferredLocale,
      updatedAt: nowServer(),
      createdAt: nowServer(),
    },
    { merge: true },
  );
};

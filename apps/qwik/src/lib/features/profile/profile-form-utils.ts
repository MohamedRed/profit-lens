const franceDefaults = {
  socialContributionRateServices: 0.212,
  incomeTaxRateLiberatorySales: 0.01,
  incomeTaxRateLiberatoryServices: 0.017,
  incomeTaxRateAssumedStandard: 0.11,
} as const;

export type BusinessActivity = 'deliveryServices' | 'services' | 'sales';
export type FixedCostAllocation = 'perHour' | 'perKm' | 'perDelivery';
export interface PresetSource {
  label: string;
  url: string;
  lastChecked: string;
}

export const franceDefaultSources: PresetSource[] = [
  {
    label: 'Auto-entrepreneur social contribution rates',
    url: 'https://entreprendre.service-public.fr/vosdroits/F37353',
    lastChecked: '2026-01-23',
  },
  {
    label: 'Auto-entrepreneur income tax (prélèvement libératoire) rates',
    url: 'https://entreprendre.service-public.fr/vosdroits/F36244',
    lastChecked: '2026-02-04',
  },
  {
    label: 'Tarif Bleu residential electricity price (base option 6 kVA)',
    url:
      'https://www.cre.fr/actualites/grille-tarifaire-des-tarifs-reglementes-bleus-residentiels-applicables-au-1er-fevrier-2026/',
    lastChecked: '2026-01-23',
  },
  {
    label: 'Daily fuel price dataset (France)',
    url: 'https://donnees.roulez-eco.fr/opendata/jour',
    lastChecked: '2026-01-23',
  },
];

export const parseNumberOrNull = (value: string): number | null => {
  const parsed = Number(value.trim());
  return Number.isFinite(parsed) ? parsed : null;
};

export const parseNumberOrZero = (value: string): number => {
  const parsed = parseNumberOrNull(value);
  return parsed ?? 0;
};

export const incomeTaxRateForActivity = (
  activity: BusinessActivity,
  useLiberatoryTax: boolean,
): number => {
  if (!useLiberatoryTax) {
    return franceDefaults.incomeTaxRateAssumedStandard;
  }
  if (activity === 'sales') {
    return franceDefaults.incomeTaxRateLiberatorySales;
  }
  return franceDefaults.incomeTaxRateLiberatoryServices;
};

export const profileFranceDefaultRates = (
  activity: BusinessActivity,
  useLiberatoryTax: boolean,
) => {
  return {
    socialRatePercent: (franceDefaults.socialContributionRateServices * 100).toFixed(1),
    incomeTaxPercent: (incomeTaxRateForActivity(activity, useLiberatoryTax) * 100).toFixed(1),
  };
};

export const resolveFixedCostAllocationError = (params: {
  allocation: FixedCostAllocation;
  monthlyFixedCosts: number;
  monthlyHours: number;
  monthlyDistance: number;
  monthlyDeliveries: number;
}): 'monthlyHoursRequiredError' | 'monthlyDistanceRequiredError' | 'monthlyDeliveriesRequiredError' | null => {
  if (params.monthlyFixedCosts <= 0) {
    return null;
  }
  if (params.allocation === 'perHour') {
    return params.monthlyHours > 0 ? null : 'monthlyHoursRequiredError';
  }
  if (params.allocation === 'perKm') {
    return params.monthlyDistance > 0 ? null : 'monthlyDistanceRequiredError';
  }
  return params.monthlyDeliveries > 0 ? null : 'monthlyDeliveriesRequiredError';
};

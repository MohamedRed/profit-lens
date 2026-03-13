import type { BillingPlan } from '../types/billing';
import { billingDefines } from './billing-defines';
import { installDefines } from './install-defines';

export const firebaseFunctionsRegion = 'europe-west1';

export const normalizeDownloadUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
};

export const androidAppDownloadUrl = normalizeDownloadUrl(installDefines.androidAppDownloadUrl);

export const billingPlans: BillingPlan[] = [
  {
    id: 'tier_9',
    priceId: billingDefines.stripePriceTier9,
    monthlyPriceEuro: 9.99,
    offerLimit: 250,
  },
  {
    id: 'tier_24',
    priceId: billingDefines.stripePriceTier24,
    monthlyPriceEuro: 24.99,
    offerLimit: 1000,
  },
  {
    id: 'tier_34',
    priceId: billingDefines.stripePriceTier34,
    monthlyPriceEuro: 34.99,
    offerLimit: null,
  },
];
